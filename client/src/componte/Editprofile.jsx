import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Editprofile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [bioLink, setBioLink] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        const data = await response.json();
        if (response.ok && isMounted) {
          setUsername(data.user.username || '');
          setBio(data.user.bio || '');
          setBioLink(data.user.bioLink || '');
          setProfilePicture(data.user.profilePicture);
          setPreviewImage(data.user.profilePicture);
        } else if (isMounted) {
          throw new Error(data.message || 'Failed to fetch profile data.');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      const res = await axios.post('https://api.cloudinary.com/v1_1/ddedv1njr/upload', formData);
      if (res.data && res.data.secure_url) {
        setProfilePicture(res.data.secure_url);
        setPreviewImage(res.data.secure_url);
      }
    } catch (uploadErr) {
      setError('Failed to upload image to cloud storage. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/updateprofile',
        { username, bio, bioLink, profilePicture },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          navigate('/Profile');
        }, 1200);
      } else {
        throw new Error(response.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="np-profile-page">
      <div className="np-profile-top-bar">
        <Link to="/Profile" className="np-btn np-btn-ghost np-btn-icon" aria-label="Cancel">
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>Edit Profile</h2>
        <div style={{ width: '40px' }} />
      </div>

      {loading ? (
        <div className="np-loading-state" style={{ minHeight: '200px' }}>
          <div className="np-spinner" />
          <p>Loading profile details...</p>
        </div>
      ) : (
        <div className="np-edit-profile-card">
          {successMessage && (
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
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: '#FEF2F2',
              color: '#991B1B',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #FECACA',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 'var(--space-2)' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Avatar Upload Section */}
            <div className="np-avatar-edit-wrap">
              <img
                src={previewImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                alt="Profile preview"
                className="np-profile-avatar-lg"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label
                  htmlFor="avatar-upload"
                  className={`np-btn np-btn-secondary ${uploading ? 'disabled' : ''}`}
                  style={{ cursor: uploading ? 'wait' : 'pointer', width: 'fit-content' }}
                >
                  <i className="fa-solid fa-camera" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  PNG, JPG, or WEBP. Max 5MB.
                </span>
              </div>
            </div>

            {/* Username Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="username" className="np-form-label" style={{ fontWeight: 600 }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                className="np-form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            {/* Bio Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="bio" className="np-form-label" style={{ fontWeight: 600 }}>
                Bio
              </label>
              <textarea
                id="bio"
                className="np-form-textarea"
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
              />
            </div>

            {/* Bio Link Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="bioLink" className="np-form-label" style={{ fontWeight: 600 }}>
                Website or Portfolio Link
              </label>
              <input
                id="bioLink"
                type="url"
                className="np-form-input"
                value={bioLink}
                onChange={(e) => setBioLink(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button
                type="submit"
                disabled={saving || uploading}
                className="np-btn np-btn-primary"
                style={{ flex: 1 }}
              >
                {saving ? (
                  <>
                    <div className="np-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <Link to="/Profile" className="np-btn np-btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Editprofile;