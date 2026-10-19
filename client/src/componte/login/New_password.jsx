import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function New_password() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const resetToken = queryParams.get('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage('');
      setSuccessMessage('');

      if (formData.password !== formData.confirmPassword) {
        return setErrorMessage('Passwords do not match');
      }

      if (!resetToken) {
        return setErrorMessage('Reset token is missing from the URL.');
      }

      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/Login');
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-auth-container">
      <div className="np-auth-card">
        <div className="np-auth-brand">
          <h1 className="np-top-nav-logo" style={{ fontSize: 'var(--font-size-2xl)' }}>
            Network <span className="np-top-nav-logo-plus">Plus</span>
          </h1>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Create New Password</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Please enter and confirm your new password
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: '#FEF2F2',
            color: '#991B1B',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FECACA',
            fontSize: 'var(--font-size-sm)',
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 'var(--space-2)' }} />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #A7F3D0',
            fontSize: 'var(--font-size-sm)',
          }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 'var(--space-2)' }} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="np-auth-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className="np-form-label" style={{ fontWeight: 600 }}>New Password</label>
              <button
                type="button"
                className="np-btn np-btn-ghost np-btn-sm"
                onClick={() => setShowPassword(!showPassword)}
                style={{ padding: '0 4px', fontSize: 'var(--font-size-xs)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              required
              className="np-form-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="confirmPassword" className="np-form-label" style={{ fontWeight: 600 }}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              required
              className="np-form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="np-btn np-btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {loading ? (
              <>
                <div className="np-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Updating password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Back to{' '}
          <Link to="/Login" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default New_password;