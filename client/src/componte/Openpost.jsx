import React, { useEffect, useState } from "react";
import { Link, Links, useParams } from "react-router-dom";



function Openpost() {
  const { postId } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // State for the post data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [copied, setCopied] = useState(false);
  const [shares, setShares] = useState([]);
  const [postStates, setPostStates] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [like, setLike] = useState(false);
  const [comments, setComments] = useState([]); // State for comments
  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/posts/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with actual token logic
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPost(data);
        setComments(data.comments || []);
        setLike(!!data.likes?.find((like) => like.userId === data.user?._id)); // Check if user has liked the post
      } else {
        throw new Error(data.message || "Failed to fetch post.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data.user);
        } else {
          throw new Error(data.message || 'Failed to fetch profile data.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();


    fetchPostData();
  }, [like,]);

  // Handle follow/unfollow
  const handleFollow = (postId, userId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isFollowing: !prev[postId]?.isFollowing || false },
    }));

    fetch(`http://localhost:5000/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isFollowing: !postStates[postId]?.isFollowing || false }),
    }).catch((err) => console.error('Error updating follow status:', err));
  };

  // Handle like/unlike
  const handleLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(() => setLike(!like)).catch((err) => console.error('Error updating like status:', err));
  };

  // Handle dislike
  const handledisLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(() => setLike(!like)).catch((err) => console.error('Error updating like status:', err));
  };

  // Handle comment submission
  const handleSubmitComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText.trim()) return;

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
      console.log(response)
      if (response.ok) {
        fetchPostData()
        setLike(like); // Refresh comments
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      } else {
        throw new Error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      console.error('Error submitting comment:', err.message);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Handle share post
  const handleSharePost = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${id}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShares(data.shares);
      } else {
        throw new Error('Failed to share post.');
      }
    } catch (error) {
      console.error('Error sharing post:', error.message);
      alert('Failed to share post. Please try again.');
    }
  };

  // Handle copy link
  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`http://localhost:3000/Openpost/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  const postState = postStates[post._id] || {};
  const commentInput = commentInputs[post._id] || '';


  const handleDeletePost = async (postId) => {
    try {
      // Confirm deletion with the user
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Make an API call to delete the post
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
        },
      });
  
      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
  
      // Update local state to remove the deleted post
    window.location.href = '/Post';
  
      console.log('Post deleted successfully');
    } catch (error) {
      // Handle errors (e.g., show an alert or log the error)
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  return (
    <div key={post._id} style={{ display: "flex", gap: '20px', margin: '15px', height: '100%', width: "100%", overflowY: 'auto', background: "linear-gradient(to right,rgb(0, 0, 0),rgb(85, 85, 85))", padding: "20px" }}>
      <div style={{ width: '60%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <a href={userData?._id !== post?.userId?._id?`/User/${post?.userId?._id}`:"/Profile"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src={post.userId.profilePicture}
              alt={`${post.username}'s profile`}
              id="user"
              style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <h3 style={{ fontWeight: "bold", color: ' #ccc' }}>{post?.userId?.username}</h3>
          </a>
          {userData && userData?._id !== post?.userId?._id && !userData?.following.includes(post?.userId?._id)  && <button
          style={{
            backgroundColor:  'black',
            color: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            margin: '10px',
            cursor: 'pointer',
            width: '100px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => handleFollow(post._id, post.userId._id)}
        >
          {postState.isFollowing ? 'Unfollow' :'Follow'}
        </button>}
        {userData && userData?._id == post?.userId?._id?<i style={{ cursor: 'pointer',fontSize: '25px', color: ' #ccc' ,margin: '10px' }}
          className="fa-solid fa-trash" onClick={() => handleDeletePost(post._id)}></i>:null}
        </div>

        {post.picture.split('.').at(-1)=="mp4"? (
        // <iframe
        //   width={560}
        //   height={315}
        //   src={post.picture}
          
        //   frameBorder={0}
        // />
        <video style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px',border: '1px solid #ccc' }} src={post.picture} controls></video>):(
          <img src={post.picture} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px',border: '1px solid #ccc' }} alt="" />
        )
      }
      </div>
      <div style={{ width: '35%', height: "100%", background: 'rgba(248, 249, 250, 0.04)', borderRadius: "10px", padding: "10px", overflowY: 'auto' }}>
        <p style={{color: ' #ccc'}}>{post.description}</p>
        {post.tags.map((tag, index) => (
          <Link style={{ color: ' #ccc' }} key={index} to={`/Search/${tag}`}>{tag}</Link>
        ))}
        <p style={{color: ' #ccc'}}>Posted on: {post.createdAt.slice(0, 10)}</p>

        <span id="span_openpost" style={{
          fontSize: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '50px',
          transition: 'color 0.3s ease',
          cursor: 'pointer',
          borderRadius: '5px',
          color:'#ccc'
        }}>
          <i onClick={() => like ? handledisLike(post._id) : handleLike(post._id) } style={{ color: like ? 'red' : 'white' }} className="fa-solid fa-heart" />
          <span style={{ marginLeft: '-15%' }}>{post?.likes?.length || 0}</span>
          <i
            className="fa-solid fa-comment"
            onClick={() => setPostStates((prev) => ({
              ...prev,
              [post._id]: { ...prev[post._id], showComments: !prev[post._id]?.showComments || false },
            }))}
            aria-label="Toggle Comments"
          />
          <span style={{ marginLeft: '-15%' }}>{post.comments?.length || 0}</span>
          <i
            className="fa-solid fa-share-square"
            onClick={() => setPostStates((prev) => ({
              ...prev,
              [post._id]: { ...prev[post._id], showShareModal: !prev[post._id]?.showShareModal || false },
            }))}
            aria-label="Share Post"
          />
          <span style={{ marginLeft: '-15%' }}>{post.shares || 0}</span>
        </span>
        <hr />

        {postState.showComments && (
          <div>
            {(post.comments || []).map((comment) => (
              <div
                key={comment._id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '10px',
                  backgroundColor: 'rgba(240, 240, 240, 0.7)',
                  borderRadius: '5px',
                  width: '100%',

                }}
              >
                <img
                  src={comment.userId?.profilePicture}
                  alt=""
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
                <p style={{ fontSize: '1rem', width: "60%", }}>
                  <strong>{comment.userId?.username}:</strong> <span
                    style={{
                      display: "block",
                      width: "100%",

                      padding: "5px",
                      wordWrap: "break-word",
                      whiteSpace: "wrap",


                      boxSizing: "border-box"
                    }}
                  >
                    {comment.text}
                  </span>
                </p>
                <i className="fa-solid fa-heart" />{' '}
                <span>{comment.likes || 0}</span>
              </div>
            ))}

            <div style={{ marginTop: '10px', width: "100%", display: "flex", gap: "5px" }}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                style={{
                  width: '80%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  marginBottom: '10px',
                }}
              />
              <button
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  width: '20%',
                  height: '38px'
                }}
                onClick={() => handleSubmitComment(post._id)}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}

        {postState.showShareModal && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.77)',
              position: 'fixed',
              top: 0,
              left: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => setPostStates((prev) => ({
              ...prev,
              [post._id]: { ...prev[post._id], showShareModal: false },
            }))}
          >
            <div
              style={{
                width: '500px',
                maxWidth: '90%',
                backgroundColor: '#f0f0f0',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3>Share Post</h3>
                <button
                  onClick={() => setPostStates((prev) => ({
                    ...prev,
                    [post._id]: { ...prev[post._id], showShareModal: false },
                  }))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }} />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  marginBottom: '10px',
                }}
              >
                {(post.interactedUsers || []).map((user) => (
                  <a href={`/user/${user._id}`} key={user._id}>
                    <img
                      src={user.profilePicture || 'https://via.placeholder.com/50'}
                      alt={user.username}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  </a>
                ))}
              </div>

              <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  marginBottom: '10px',
                }}
              >
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-facebook" style={{ fontSize: '20px', color: '#3b5998' }} />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=Check out this post: https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '20px', color: '#25D366' }} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-twitter" style={{ fontSize: '20px', color: '#1DA1F2' }} />
                </a>
                <a
                  href={`https://www.instagram.com/share?url=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-instagram" style={{ fontSize: '20px', color: '#E1306C' }} />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?url=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-linkedin" style={{ fontSize: '20px', color: '#0077B5' }} />
                </a>
                <a
                  href={`https://www.youtube.com/share?url=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-youtube" style={{ fontSize: '20px', color: '#FF0000' }} />
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=https://example.com/post/${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-pinterest" style={{ fontSize: '20px', color: '#BD081C' }} />
                </a>
              </div>

              <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <input
                  type="text"
                  value={`https://example.com/post/${post._id}`}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                  }}
                />
                <button
                  onClick={() => handleCopyLink(post._id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: copied ? '#28a745' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Openpost;