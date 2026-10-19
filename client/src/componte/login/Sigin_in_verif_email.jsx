import React from 'react';
import { Link } from 'react-router-dom';

function Sigin_in_verif_email() {
  return (
    <div className="np-auth-container">
      <div className="np-auth-card" style={{ textAlign: 'center' }}>
        <div className="np-auth-brand">
          <h1 className="np-top-nav-logo" style={{ fontSize: 'var(--font-size-2xl)' }}>
            Network <span className="np-top-nav-logo-plus">Plus</span>
          </h1>
        </div>

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          fontSize: '28px',
          color: 'var(--color-text-primary)',
        }}>
          <i className="fa-regular fa-envelope-open" />
        </div>

        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>Check your inbox</h2>

        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed, 1.5)' }}>
          Thanks for signing up for Network Plus! We've sent a verification link to your email address. Please click the link inside to activate your account.
        </p>

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
          Didn't receive the email? Check your spam folder or try logging in to resend.
        </p>

        <Link to="/Login" className="np-btn np-btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default Sigin_in_verif_email;