import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Forget_password() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSuccess(data.message || 'If that email is registered, password reset instructions have been sent.');
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
    setSuccess(null);
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
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Reset Password</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: '#FEF2F2',
            color: '#991B1B',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FECACA',
            fontSize: 'var(--font-size-sm)',
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 'var(--space-2)' }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #A7F3D0',
            fontSize: 'var(--font-size-sm)',
          }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 'var(--space-2)' }} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="np-auth-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="email" className="np-form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="np-form-input"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
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
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Remember your password?{' '}
          <Link to="/Login" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Forget_password;