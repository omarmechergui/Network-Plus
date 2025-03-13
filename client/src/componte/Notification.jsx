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
console.log(notifications)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.ok) setUserData(data.user);
        else throw new Error(data.message || 'Failed to fetch user data.');
      } catch (err) {
        setError('Failed to load user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userData?._id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.ok) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      } catch (error) {
        setError('Failed to load notifications.');
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    socket.emit('setUser', userData._id);
    fetchNotifications();

    const handleNewNotification = (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [userData]);

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all as read.');
      console.error('Error marking notifications as read:', err);
    }
  };

  const markAsRead = async (id) => {
    const previousNotifications = [...notifications];
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => prev - 1);

      await fetch(`http://localhost:5000/api/notifications/${id}/mark-as-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      setError('Failed to mark as read.');
      setNotifications(previousNotifications);
      setUnreadCount((prev) => prev + 1);
      console.error('Error marking notification as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.senderId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search notifications"
      />
      <button onClick={markAllAsRead} disabled={unreadCount === 0}>
        Read all ({unreadCount})
      </button>
      <section>
        {filteredNotifications.map((notification) => (
          <div key={notification._id} className="notification-item" style={{ display: 'flex', alignItems: 'center',justifyContent:"start",gap:"20px",border:'1px solid black',padding:"5px", }}>
            <div >
              <img
              style={{borderRadius:"50%",width:"50px",height:"50px"}}
                src={notification.senderId.profilePicture || '/default-avatar.png'}
                className="profile-image"
                alt={`${notification.senderId.username}'s profile`}
              />
            </div>
            <div>
              <span>{notification.senderId.username}</span>
              <span>{notification.message}</span>
            </div>
            {!notification.isRead && (
              <button onClick={() => markAsRead(notification._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default Notification;