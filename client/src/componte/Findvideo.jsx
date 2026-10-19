import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

function Findvideo({ video, index, userData, fetchPosts }) {
  const [postStates, setPostStates] = useState({});
  const [like, setLike] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [copied, setCopied] = useState(false);

  const commentInput = commentInputs[video._id] || '';
  const postState = postStates[video._id] || {};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/Openpost/${video._id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShowShareModal = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showShareModal: !prev[postId]?.showShareModal || false },
    }));
  };

  const handlePostClick = () => {
    setShowModal(true);
  };

  const handleSubmitComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();
      if (response.ok) {
        setLike(!like);
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      } else {
        throw new Error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      console.error('Error submitting comment:', err.message);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handledisLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setLike(!like);
      })
      .catch((err) => console.error('Error updating like status:', err));
  };

  const handleLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setLike(!like);
      })
      .catch((err) => console.error('Error updating like status:', err));
  };

  useEffect(() => {
    if (fetchPosts) {
      fetchPosts();
    }
  }, [like]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only render if video ends with mp4
  if (!video?.picture || video.picture.split('.').at(-1) !== 'mp4') {
    return null;
  }

  const isLikedByCurrentUser =
    Boolean(userData && video?.likes?.some((l) => (typeof l === 'object' ? l._id === userData._id : l === userData._id)));
  const postUrl = `${window.location.origin}/Openpost/${video._id}`;
  const authorProfileLink = userData?._id !== video?.userId?._id ? `/User/${video?.userId?._id}` : '/Profile';

  return (
    <article key={video._id || index} className="np-post-card np-video-card">
      {/* Video Header with Author info */}
      <header className="np-post-header">
        <Link to={authorProfileLink} className="np-post-author">
          <img
            src={video.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
            alt={`${video.userId?.username || 'User'}'s avatar`}
            className="np-post-avatar"
            onError={(e) => {
              e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
            }}
          />
          <div className="np-post-author-meta">
            <span className="np-post-author-name">{video.userId?.username || 'Anonymous'}</span>
            <span className="np-post-timestamp">
              {video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>
        </Link>
      </header>

      {/* Video Media Player Container */}
      <div className="np-video-media-wrapper">
        <video
          src={video.picture}
          controls
          muted
          playsInline
        />
      </div>

      {/* Video Caption & Info */}
      {video.description && (
        <p className="np-post-description">{video.description}</p>
      )}

      {/* Action Buttons */}
      {userData && (
        <div className="np-post-actions">
          <button
            type="button"
            className={`np-action-btn ${isLikedByCurrentUser ? 'liked' : ''}`}
            onClick={() => (isLikedByCurrentUser ? handledisLike(video._id) : handleLike(video._id))}
            aria-label={isLikedByCurrentUser ? 'Unlike video' : 'Like video'}
          >
            <i className={isLikedByCurrentUser ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
            <span className="np-action-count">{video.likes?.length || 0}</span>
            <span>Like</span>
          </button>

          <button
            type="button"
            className="np-action-btn"
            onClick={handlePostClick}
            aria-label="View comments"
          >
            <i className="fa-regular fa-comment" />
            <span className="np-action-count">{video.comments?.length || 0}</span>
            <span>Comment</span>
          </button>

          <button
            type="button"
            className="np-action-btn"
            onClick={() => handleShowShareModal(video._id)}
            aria-label="Share video"
          >
            <i className="fa-regular fa-share-from-square" />
            <span className="np-action-count">{video.shares || 0}</span>
            <span>Share</span>
          </button>
        </div>
      )}

      {/* Video Comments Modal */}
      <Modal show={showModal} onClose={handleCloseModal}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            margin: 'auto',
            border: 'var(--border-default)',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Comments</h3>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleCloseModal}
              aria-label="Close comments"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {video.comments && video.comments.length > 0 ? (
              video.comments.map((comment, idx) => (
                <div key={comment._id || idx} className="np-comment-item">
                  <img
                    src={comment.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                    alt={`${comment.userId?.username || 'User'}'s avatar`}
                    className="np-comment-avatar"
                    onError={(e) => {
                      e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                    }}
                  />
                  <div className="np-comment-bubble">
                    <div className="np-comment-author">{comment.userId?.username || 'User'}</div>
                    <p className="np-comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-4) 0' }}>
                No comments yet.
              </p>
            )}
          </div>

          <form
            className="np-comment-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitComment(video._id);
            }}
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="np-comment-input"
              value={commentInput}
              onChange={(e) => setCommentInputs((prev) => ({ ...prev, [video._id]: e.target.value }))}
            />
            <button
              type="submit"
              className="np-comment-submit"
              disabled={!commentInput.trim()}
            >
              Post
            </button>
          </form>
        </div>
      </Modal>

      {/* Share Modal Dialog */}
      {postState.showShareModal && (
        <div
          className="np-modal-backdrop"
          onClick={() => handleShowShareModal(video._id)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="np-share-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="np-share-header">
              <h3>Share Video</h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleShowShareModal(video._id)}
                aria-label="Close dialog"
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: '18px' }} />
              </button>
            </div>

            <div className="np-social-grid">
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-facebook" style={{ color: '#1877F2' }} />
                <span>Facebook</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this video: ${postUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }} />
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-x-twitter" style={{ color: '#111111' }} />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-linkedin" style={{ color: '#0A66C2' }} />
                <span>LinkedIn</span>
              </a>
            </div>

            <div className="np-copy-row">
              <input
                type="text"
                readOnly
                value={postUrl}
                className="np-copy-input"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyLink}
                style={{ minWidth: '100px' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default Findvideo;