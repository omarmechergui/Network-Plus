import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    axios
      .post('http://localhost:5000/api/users/register/' + token)
      .then((res) => {
        if (res.status === 200 && isMounted) {
          setLoading(false);
          setTimeout(() => {
            navigate('/Login');
          }, 1500);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoading(false);
          setError(err.response?.data?.message || 'Verification failed or link expired.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <div className="np-auth-container">
      <div className="np-auth-card" style={{ textAlign: 'center' }}>
        <div className="np-auth-brand">
          <h1 className="np-top-nav-logo" style={{ fontSize: 'var(--font-size-2xl)' }}>
            Network <span className="np-top-nav-logo-plus">Plus</span>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6) 0' }}>
            <div className="np-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>
              Verifying your account...
            </p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
            <Link to="/Login" className="np-btn np-btn-primary" style={{ marginTop: 'var(--space-2)' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
              Account verified successfully! Redirecting to login...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;