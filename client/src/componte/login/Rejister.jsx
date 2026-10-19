import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Siginin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    Birthday: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

      setLoading(true);

      const response = await fetch('http://localhost:5000/api/users/validate_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `${formData.firstname} ${formData.lastname}`.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/Sigin_in_verif_email', { replace: true });
        }, 1500);
      } else {
        setErrorMessage(data.message || 'An error occurred during registration.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-auth-container">
      <div className="np-auth-card" style={{ maxWidth: '480px' }}>
        {/* Brand */}
        <div className="np-auth-brand">
          <h1 className="np-top-nav-logo" style={{ fontSize: 'var(--font-size-2xl)' }}>
            Network <span className="np-top-nav-logo-plus">Plus</span>
          </h1>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Create an account</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Join the community and share your story
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="firstname" className="np-form-label" style={{ fontWeight: 600 }}>First Name</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                required
                className="np-form-input"
                value={formData.firstname}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="lastname" className="np-form-label" style={{ fontWeight: 600 }}>Last Name</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                required
                className="np-form-input"
                value={formData.lastname}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="Birthday" className="np-form-label" style={{ fontWeight: 600 }}>Birthday</label>
            <input
              type="date"
              id="Birthday"
              name="Birthday"
              className="np-form-input"
              value={formData.Birthday}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="email" className="np-form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="np-form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="password" className="np-form-label" style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
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
              type="password"
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/Login" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Siginin;