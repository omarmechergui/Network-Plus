import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Notification() {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const data = await response.json();
        if (response.ok && isMounted) {
          setUserData(data.user);
        } else if (isMounted) {
          throw new Error(data.message || 'Failed to fetch user data.');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load user data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userData?._id) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const data = await response.json();
        if (response.ok && isMounted && Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load notifications.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const token = localStorage.getItem('token');
    socket.emit('setUser', { userId: userData._id, token });
    fetchNotifications();

    const handleNewNotification = (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      isMounted = false;
      socket.off('notification', handleNewNotification);
    };
  }, [userData]);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  const markAsRead = async (id) => {
    const previousNotifications = [...notifications];
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/mark-as-read`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
    } catch (err) {
      setError('Failed to mark as read.');
      setNotifications(previousNotifications);
      setUnreadCount((prev) => prev + 1);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const sender = n.senderId?.username?.toLowerCase() || '';
    const message = n.message?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return sender.includes(term) || message.includes(term);
  });

  return (
    <div className="np-notif-container">
      {/* Toolbar */}
      <div className="np-notif-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
            }}
          />
          <input
            type="search"
            className="np-form-input"
            style={{ paddingLeft: 'calc(var(--space-3) * 2 + 14px)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter notifications..."
          />
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="np-btn np-btn-outline np-btn-sm"
        >
          <i className="fa-solid fa-check-double" />
          Mark all as read {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {error && (
        <div className="np-error-state">
          <i className="fa-solid fa-circle-exclamation np-error-state-icon" />
          <p className="np-error-state-title">{error}</p>
        </div>
      )}

      {loading && (
        <div className="np-loading-state" style={{ minHeight: '180px' }}>
          <div className="np-spinner" />
          <p>Loading notifications...</p>
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <div className="np-empty-state" style={{ minHeight: '220px' }}>
          <i className="fa-regular fa-bell np-empty-state-icon" />
          <p className="np-empty-state-title">No notifications</p>
          <p className="np-empty-state-subtitle">When someone interacts with your posts or follows you, you'll see it here.</p>
        </div>
      )}

      {!loading && filteredNotifications.length > 0 && (
        <div className="np-notif-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`np-notif-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <img
                src={notification.senderId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                className="np-contact-avatar"
                alt=""
              />
              <div className="np-notif-content">
                <span style={{ fontWeight: 600 }}>{notification.senderId?.username || 'Someone'}</span>{' '}
                <span>{notification.message}</span>
              </div>
              {!notification.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(notification._id)}
                  className="np-btn np-btn-ghost np-btn-sm"
                  title="Mark as read"
                >
                  <i className="fa-solid fa-check" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notification;