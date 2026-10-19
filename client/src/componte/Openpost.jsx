import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Openpost() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [postStates, setPostStates] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [like, setLike] = useState(false);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/posts/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPost(data);
      } else {
        throw new Error(data.message || "Failed to fetch post.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/users/getuser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err.message);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPostData();
  }, [postId, like]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFollow = (postIdToFollow, userId) => {
    setPostStates((prev) => ({
      ...prev,
      [postIdToFollow]: { ...prev[postIdToFollow], isFollowing: !prev[postIdToFollow]?.isFollowing || false },
    }));

    fetch(`http://localhost:5000/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isFollowing: !postStates[postIdToFollow]?.isFollowing || false }),
    })
      .then(() => fetchUserData())
      .catch((err) => console.error('Error updating follow status:', err));
  };

  const handleLike = (postIdToLike) => {
    fetch(`http://localhost:5000/api/posts/${postIdToLike}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => setLike(!like))
      .catch((err) => console.error('Error updating like status:', err));
  };

  const handledisLike = (postIdToDislike) => {
    fetch(`http://localhost:5000/api/posts/${postIdToDislike}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => setLike(!like))
      .catch((err) => console.error('Error updating like status:', err));
  };

  const handleSubmitComment = async (postIdToComment) => {
    const commentText = commentInputs[postIdToComment];
    if (!commentText || !commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postIdToComment}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        fetchPostData();
        setCommentInputs((prev) => ({ ...prev, [postIdToComment]: '' }));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      console.error('Error submitting comment:', err.message);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/Openpost/${postId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDeletePost = async (postIdToDelete) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;

      const response = await fetch(`http://localhost:5000/api/posts/${postIdToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      window.location.href = '/Post';
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="np-content-single">
        <div className="np-feed-state" style={{ maxWidth: '640px', margin: '40px auto' }}>
          <div className="np-spinner" role="status" aria-label="Loading post details" />
          <p className="np-feed-state-title">Loading post details...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="np-content-single">
        <div className="np-feed-state" style={{ maxWidth: '640px', margin: '40px auto' }}>
          <i className="fa-solid fa-triangle-exclamation np-feed-state-icon" style={{ color: 'var(--color-danger)' }} />
          <p className="np-feed-state-title">Post Not Found</p>
          <p className="np-feed-state-desc">{error || 'This post could not be retrieved or has been deleted.'}</p>
          <Link to="/Post" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
            <i className="fa-solid fa-arrow-left" /> Back to Feed
          </Link>
        </div>
      </main>
    );
  }

  const postState = postStates[post._id] || {};
  const commentInput = commentInputs[post._id] || '';
  const isVideo = post.picture && post.picture.split('.').at(-1) === 'mp4';
  const isOwner = userData && post.userId && userData._id === post.userId._id;
  const isLikedByCurrentUser = Boolean(
    userData && post.likes?.some((l) => (typeof l === 'object' ? l._id === userData._id : l === userData._id))
  );
  const postUrl = `${window.location.origin}/Openpost/${post._id}`;
  const authorProfileLink = userData?._id !== post.userId?._id ? `/User/${post.userId?._id}` : '/Profile';

  return (
    <main className="np-content-single">
      <div className="np-openpost-layout">
        {/* Left Column: Media and Author */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Author Header */}
          <header className="np-post-header">
            <Link to={authorProfileLink} className="np-post-author">
              <img
                src={post.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                alt={`${post.userId?.username || 'User'}'s avatar`}
                className="np-post-avatar"
                onError={(e) => {
                  e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                }}
              />
              <div className="np-post-author-meta">
                <span className="np-post-author-name">{post.userId?.username || 'Anonymous'}</span>
                <span className="np-post-timestamp">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {userData && !isOwner && (
                <button
                  type="button"
                  className={`np-btn-follow ${postState.isFollowing || userData.following?.includes(post.userId?._id) ? 'following' : ''}`}
                  onClick={() => handleFollow(post._id, post.userId._id)}
                >
                  {postState.isFollowing || userData.following?.includes(post.userId?._id) ? 'Following' : 'Follow'}
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => handleDeletePost(post._id)}
                  title="Delete post"
                  aria-label="Delete post"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <i className="fa-solid fa-trash-can" style={{ fontSize: '1.1rem' }} />
                </button>
              )}
            </div>
          </header>

          {/* Media Player / Viewer */}
          {post.picture && (
            <div className="np-post-media-container" style={{ minHeight: '380px' }}>
              {isVideo ? (
                <video
                  className="np-post-media"
                  src={post.picture}
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={post.picture}
                  alt={post.description || 'Post media'}
                  className="np-post-media"
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Content, Stats, and Discussion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Post Caption / Text */}
          {post.text && (
            <p className="np-post-content" style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', margin: 0 }}>
              {post.text}
            </p>
          )}

          {post.description && (
            <p className="np-post-description" style={{ color: 'var(--text-main)', fontSize: 'var(--font-size-sm)' }}>
              {post.description}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="np-post-tags">
              {post.tags.map((tag, idx) => (
                <Link key={idx} to="/Search" className="np-post-tag">
                  #{tag.replace(/^#/, '')}
                </Link>
              ))}
            </div>
          )}

          {/* Interactive Actions */}
          {userData && (
            <div className="np-post-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={`np-action-btn ${isLikedByCurrentUser ? 'liked' : ''}`}
                onClick={() => (isLikedByCurrentUser ? handledisLike(post._id) : handleLike(post._id))}
              >
                <i className={isLikedByCurrentUser ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
                <span className="np-action-count">{post.likes?.length || 0}</span>
                <span>Like</span>
              </button>

              <button
                type="button"
                className="np-action-btn"
                onClick={() => {
                  const input = document.getElementById('openpost-comment-input');
                  if (input) input.focus();
                }}
              >
                <i className="fa-regular fa-comment" />
                <span className="np-action-count">{post.comments?.length || 0}</span>
                <span>Comments</span>
              </button>

              <button
                type="button"
                className="np-action-btn"
                onClick={() => setPostStates((prev) => ({ ...prev, [post._id]: { ...prev[post._id], showShareModal: true } }))}
              >
                <i className="fa-regular fa-share-from-square" />
                <span className="np-action-count">{post.shares || 0}</span>
                <span>Share</span>
              </button>
            </div>
          )}

          {/* Comments Discussion Section */}
          <section className="np-comments-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h4 style={{ margin: 'var(--space-2) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-main)' }}>
              Comments ({post.comments?.length || 0})
            </h4>

            <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment, idx) => (
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
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-4) 0' }}>
                  No comments yet. Start the conversation!
                </p>
              )}
            </div>

            {/* Comment Form */}
            <form
              className="np-comment-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitComment(post._id);
              }}
            >
              <input
                id="openpost-comment-input"
                type="text"
                placeholder="Write a comment..."
                className="np-comment-input"
                value={commentInput}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
              />
              <button
                type="submit"
                className="np-comment-submit"
                disabled={!commentInput.trim()}
              >
                Post
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {postState.showShareModal && (
        <div
          className="np-modal-backdrop"
          onClick={() => setPostStates((prev) => ({ ...prev, [post._id]: { ...prev[post._id], showShareModal: false } }))}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="np-share-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="np-share-header">
              <h3>Share Post</h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPostStates((prev) => ({ ...prev, [post._id]: { ...prev[post._id], showShareModal: false } }))}
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
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this post: ${postUrl}`)}`}
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
    </main>
  );
}

export default Openpost;