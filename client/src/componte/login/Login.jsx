import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Login successful! Redirecting...');
        localStorage.setItem('token', data.token);
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } else {
        setErrorMessage(data.message || 'Invalid email or password');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-auth-container">
      <div className="np-auth-card">
        {/* Brand */}
        <div className="np-auth-brand">
          <h1 className="np-top-nav-logo" style={{ fontSize: 'var(--font-size-2xl)' }}>
            Network <span className="np-top-nav-logo-plus">Plus</span>
          </h1>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Welcome back</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Enter your credentials to access your account
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
            <label htmlFor="email" className="np-form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="np-form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className="np-form-label" style={{ fontWeight: 600 }}>Password</label>
              <Link to="/Forgrt_password" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                className="np-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input type="checkbox" id="remember-me" name="remember-me" />
            <label htmlFor="remember-me" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Remember me
            </label>
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="np-auth-divider">or connect with</div>

        <div className="np-social-auth-btns">
          <button type="button" className="np-social-icon-btn" aria-label="Sign in with Google">
            <i className="fa-brands fa-google" />
          </button>
          <button type="button" className="np-social-icon-btn" aria-label="Sign in with GitHub">
            <i className="fa-brands fa-github" />
          </button>
          <button type="button" className="np-social-icon-btn" aria-label="Sign in with Facebook">
            <i className="fa-brands fa-facebook" />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/Siginin" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;