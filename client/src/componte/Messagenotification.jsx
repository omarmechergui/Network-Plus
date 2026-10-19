import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

function Messagenotification() {
  const [issound, setIsound] = useState(false);
  const location = useLocation();

  const isNotificationTab = location.pathname.toLowerCase().includes('/notification');

  const handleSound = () => {
    setIsound(!issound);
  };

  return (
    <div className="np-msg-page">
      {/* Top Header */}
      <div className="np-msg-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/" className="np-btn np-btn-ghost np-btn-icon" aria-label="Go back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div className="np-tab-switch">
            <Link
              to="/Message"
              className={`np-tab-switch-btn ${!isNotificationTab ? 'active' : ''}`}
            >
              <i className="fa-regular fa-comment-dots" style={{ marginRight: 'var(--space-2)' }} />
              Messages
            </Link>
            <Link
              to="/Message/Notification"
              className={`np-tab-switch-btn ${isNotificationTab ? 'active' : ''}`}
            >
              <i className="fa-regular fa-bell" style={{ marginRight: 'var(--space-2)' }} />
              Notifications
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSound}
          className="np-btn np-btn-ghost np-btn-icon"
          title={issound ? 'Mute sounds' : 'Enable sounds'}
          aria-label={issound ? 'Mute sounds' : 'Enable sounds'}
        >
          {issound ? (
            <i className="fa-solid fa-bell-slash" />
          ) : (
            <i className="fa-solid fa-bell" />
          )}
        </button>
      </div>

      {/* Nested Content (Message or Notification) */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Messagenotification;