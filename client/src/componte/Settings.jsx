import React, { useState } from 'react';

const Settings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    lastPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    notifications: true,
    theme: 'light',
    language: 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleNotifications = () => {
    setFormData((prevState) => ({
      ...prevState,
      notifications: !prevState.notifications,
    }));
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-4)' }}>
      <div className="np-settings-card">
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Account Settings</h2>

        {saveSuccess && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #A7F3D0',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
          }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 'var(--space-2)' }} />
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Account Info */}
          <div className="np-settings-group">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>Profile Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="username" className="np-form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="np-form-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="email" className="np-form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="np-form-input"
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="np-settings-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>Password Security</h3>
              <button
                type="button"
                className="np-btn np-btn-ghost np-btn-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="lastPassword" className="np-form-label">Current Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="lastPassword"
                name="lastPassword"
                value={formData.lastPassword}
                onChange={handleChange}
                className="np-form-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="newPassword" className="np-form-label">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="np-form-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="confirmNewPassword" className="np-form-label">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="np-form-input"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="np-settings-group">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, margin: 0 }}>Preferences</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Push Notifications</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Receive updates about likes and comments
                </div>
              </div>
              <button
                type="button"
                onClick={toggleNotifications}
                className={`np-btn np-btn-sm ${formData.notifications ? 'np-btn-primary' : 'np-btn-outline'}`}
              >
                {formData.notifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="theme" className="np-form-label">Theme</label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="np-form-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="language" className="np-form-label">Language</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="np-form-input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <button type="submit" className="np-btn np-btn-primary" style={{ width: '100%' }}>
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
