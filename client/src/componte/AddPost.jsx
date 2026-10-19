import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPost = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleMediaChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size (e.g. 50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return;
    }

    const isVid = selectedFile.type.startsWith('video/');
    setIsVideo(isVid);
    setError(null);

    // Instant local preview
    const localUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(localUrl);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default');

      const res = await axios.post('https://api.cloudinary.com/v1_1/ddedv1njr/upload', formData);
      if (res.data && res.data.secure_url) {
        setPreviewUrl(res.data.secure_url);
      }
    } catch (uploadErr) {
      setError('Failed to upload media to cloud storage. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption.trim() || !previewUrl) {
      setError('Caption and media are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const tagList = tags
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const response = await axios.post(
        'http://localhost:5000/api/posts/add',
        {
          description: caption,
          tags: tagList,
          picture: previewUrl,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setError('Failed to add the post. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while adding the post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-4)' }}>
      <div className="np-addpost-card">
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0, textAlign: 'center' }}>
          Create New Post
        </h2>

        {success && (
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
            Post created successfully! Redirecting...
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Media Upload Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label className="np-form-label" style={{ fontWeight: 600 }}>Media (Photo or Video)</label>

            {previewUrl ? (
              <div className="np-media-preview-box" style={{ position: 'relative' }}>
                {isVideo ? (
                  <video src={previewUrl} controls playsInline />
                ) : (
                  <img src={previewUrl} alt="Preview" />
                )}
                {uploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                  }}>
                    <div className="np-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    Uploading media...
                  </div>
                )}
              </div>
            ) : (
              <label
                htmlFor="media-file-input"
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg-secondary)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '32px', color: 'var(--color-text-secondary)' }} />
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Click to upload an image or video</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                  PNG, JPG, MP4 up to 50MB
                </span>
              </label>
            )}

            <input
              id="media-file-input"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />

            {previewUrl && (
              <label
                htmlFor="media-file-input"
                className="np-btn np-btn-ghost np-btn-sm"
                style={{ width: 'fit-content', alignSelf: 'center', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-rotate" /> Change media
              </label>
            )}
          </div>

          {/* Caption */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="caption" className="np-form-label" style={{ fontWeight: 600 }}>Caption</label>
            <textarea
              id="caption"
              className="np-form-textarea"
              rows="3"
              placeholder="What's happening?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="tags" className="np-form-label" style={{ fontWeight: 600 }}>Tags</label>
            <input
              id="tags"
              type="text"
              className="np-form-input"
              placeholder="e.g. tech, coding, network (comma or space separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading || !caption.trim() || !previewUrl}
            className="np-btn np-btn-primary"
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? (
              <>
                <div className="np-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPost;