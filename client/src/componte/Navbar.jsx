import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch user profile
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error('Navbar user fetch error:', err);
      }
    };

    // Fetch unread notification count
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const unread = data.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Navbar notification fetch error:', err);
      }
    };

    fetchUserData();
    fetchNotifications();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUserData(null);
    navigate('/Login');
  };

  return (
    <>
      {/* ====================================================================
          DESKTOP TOP NAVIGATION BAR
          ==================================================================== */}
      <header className="np-top-nav" role="banner">
        <div className="np-top-nav-inner">
          {/* Brand Logo */}
          <Link to="/" className="np-brand" aria-label="Network-Plus Home">
            <span>Network</span>
            <span className="np-brand-badge">Plus</span>
          </Link>

          {/* Desktop Nav Destinations */}
          <nav className="np-nav-links np-top-nav-links" aria-label="Main Navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `np-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className="fa-solid fa-house" aria-hidden="true" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/Post"
              className={({ isActive }) => `np-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className="fa-regular fa-image" aria-hidden="true" />
              <span>Posts</span>
            </NavLink>

            <NavLink
              to="/Search"
              className={({ isActive }) => `np-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>Search</span>
            </NavLink>

            <NavLink
              to="/Add"
              className={({ isActive }) => `np-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" />
              <span>Add</span>
            </NavLink>

            <NavLink
              to="/Message"
              className={({ isActive }) =>
                `np-nav-item ${location.pathname.startsWith('/Message') && !location.pathname.includes('/Notification') ? 'active' : ''}`
              }
            >
              <i className="fa-regular fa-comment-dots" aria-hidden="true" />
              <span>Messages</span>
            </NavLink>

            <NavLink
              to="/Message/Notification"
              className={({ isActive }) =>
                `np-nav-item ${isActive || location.pathname === '/Notification' ? 'active' : ''}`
              }
            >
              <i className="fa-regular fa-bell" aria-hidden="true" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="np-badge-count" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Right Action Items */}
          <div className="np-nav-actions">
            {userData ? (
              <>
                <NavLink
                  to="/Profile"
                  className={({ isActive }) =>
                    `np-profile-avatar-btn ${isActive ? 'active' : ''}`
                  }
                  title="Your Profile"
                >
                  {userData.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.username || 'User Profile'}
                      className="np-avatar-thumb"
                    />
                  ) : (
                    <div className="np-avatar-placeholder">
                      <i className="fa-solid fa-user" aria-hidden="true" />
                    </div>
                  )}
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                    {userData.username}
                  </span>
                </NavLink>

                <NavLink
                  to="/Settings"
                  className="btn-ghost"
                  title="Settings"
                  aria-label="Settings"
                >
                  <i className="fa-solid fa-gear" aria-hidden="true" />
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="btn-ghost"
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link to="/Login" className="btn-secondary">
                  Log In
                </Link>
                <Link to="/Siginin" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MOBILE FIXED BOTTOM NAVIGATION BAR
          ==================================================================== */}
      <nav className="np-bottom-nav" aria-label="Mobile Navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `np-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-house" aria-hidden="true" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/Search"
          className={({ isActive }) => `np-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <span>Search</span>
        </NavLink>

        <NavLink
          to="/Add"
          className={({ isActive }) => `np-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          <span>Add</span>
        </NavLink>

        <NavLink
          to="/Message"
          className={({ isActive }) =>
            `np-bottom-nav-item ${location.pathname.startsWith('/Message') && !location.pathname.includes('/Notification') ? 'active' : ''}`
          }
        >
          <i className="fa-regular fa-comment-dots" aria-hidden="true" />
          <span>Messages</span>
        </NavLink>

        <NavLink
          to={userData ? '/Profile' : '/Login'}
          className={({ isActive }) => `np-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-regular fa-user" aria-hidden="true" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;