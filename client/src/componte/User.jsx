import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Link, useParams } from 'react-router-dom';

function User() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null); // State for user profile data
  const [userconnect, setUserconnect] = useState(null); // State for user profile data
  const [posts, setPosts] = useState([]); // State for user posts
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedImage, setSelectedImage] = useState(null); // State for selected post image
    const [category, setCategory] = useState('');
  
  const [isFollowing, setIsFollowing] = useState(false); // State for follow/unfollow status
  const fetchUserconnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/getuser', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
        },
      });
      
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setUserconnect(data.user);
         
      } else {
        throw new Error(data.message || 'Failed to fetch profile data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Fetch user data and posts from the backend when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/users/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.user);
          setPosts(data.posts || []);
          setIsFollowing(data.user.following.includes(id)); // Set initial follow status
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
    fetchUserconnect()
  }, [id]);

  // Handle post click to open modal
  const handlePostClick = (src) => {
    setSelectedImage(src);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  // Handle follow/unfollow functionality
  const handleFollow = async () => {
    try {
      setLoading(true);

      // Toggle the local state immediately for better UX
      setIsFollowing((prev) => !prev);

      // Determine the method based on current follow status
      const method =  'POST';

      // Make the API call to update follow status
      const response = await fetch(`http://localhost:5000/api/users/${id}/${userconnect.following.includes(id) ? 'unfollow' : 'follow'}`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update follow status.');
      }

      console.log('Follow status updated successfully');
    } catch (error) {
      console.error('Error updating follow status:', error);

      // Revert the local state change if the API call fails
      setIsFollowing((prev) => !prev);
      alert('An error occurred while updating the follow status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="body_profile">
      {/* Loading Indicator */}
      {loading && <p className="loading">Loading profile...</p>}
      {/* Error Message */}
      {error && <p className="error">{error}</p>}
      {/* Header */}
      <header id="header_profile">
        <div>
          <a id="a_profile" href="/Home">
            <i className="fa-solid fa-arrow-left" />
          </a>
          <span>
            <h1 id="network">
              Network <span id="plus">Plus</span>
            </h1>
          </span>
        </div>
      </header>
      {/* Profile Section */}
      {userData ? (
        <>
          <section id="section1_profile">
            <div id="div_profile">
              <div>
                <img
                  src={userData.profilePicture}
                  alt={`${userData.username}'s profile`}
                  id="profile_image"
                />
                <br />
                <h3 id="username">{userData.username}</h3>
              </div>
              <div id="div1_profile">
                <div>
                  <h2>{userData.followers.length || 0}</h2>
                  <p>followers</p>
                </div>
                <div>
                  <h2>{userData.following.length || 0}</h2>
                  <p>following</p>
                </div>
                <div>
                  <h2>{posts.length}</h2>
                  <p>posts</p>
                </div>
                <div>
                  <h2>{posts.reduce((total, post) => total + post.likes.length, 0) || 0}</h2>
                  <p>likes</p>
                </div>
              </div>
            </div>
          </section>
          <section id="section2_profile">
            <div>
              <p id="bio_profile">
                {userData.bio || 'No bio available.'}{' '} <br />
                {userData.bioLink && (
                  <a style={{ color: 'blue' }} href={userData.bioLink} target="_blank" rel="noopener noreferrer">
                    {userData.bioLink}
                  </a>
                )}
              </p>
            </div>
            <div>
              <p>
                <input
                  type="button"
                  defaultValue={userconnect?.following?.includes(id) ? 'Unfollow' : 'Follow'}
                  className="profile_button"
                  onClick={handleFollow}
                />
                <input type="button" defaultValue="Share Profile" className="profile_button" />
              </p>
            </div>
          </section>
          <section id="section3_profile">
            <div id="button_nav">
            <button className="nav_button" onClick={() => setCategory('')}>
                <a id="a_profile" >
                  <i id="i_profile" className="fa-solid fa-bars" />
                </a>
              </button>
              <button className="nav_button" onClick={() => setCategory('videos')}>
                <a id="a_profile">
                  <i id="i_profile" className="fa-solid fa-film" />
                </a>
              </button>
              <button className="nav_button" onClick={() => setCategory('images')}>
                <a id="a_profile" >
                  <i id="i_profile" className="fa-regular fa-images" />
                </a>
              </button>
            </div>
          </section>
          <hr />
          {/* Posts Section */}
          <section id="section4_profile">
            <div id="all_profile">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1%', justifyContent: 'center', alignItems: 'center' ,border:'1px solid black',width:'100%' }}>
                {posts.filter((post) => category==""?post: category=="videos"?post.picture.split('.').at(-1)=="mp4":category=="images"?post.picture.split('.').at(-1)=="jpg"||post.picture.split('.').at(-1)=="png"||post.picture.split('.').at(-1)=="jpeg":category=="likes"?post.likes.includes(userData._id):null ).map((post) => (
                  <Link to={`/openpost/${post._id}`}
                    key={post._id}
                    onClick={() => handlePostClick(post.picture)}
                    className="post_thumbnail"
                    style={{width:'32%',marginTop:'10px',justifyContent: 'center'}}
                  >
                    {/* <img
                      src={post.picture}
                      alt={`Post ${post._id}`}
                      className="post_image"
                      style={{width:'100%',borderRadius:'10px'}}
                    /> */}
                    {post.picture.split('.').at(-1)=="mp4"? (
                    
                    <video 
                    style={{width:'100%',borderRadius:'10px'}}
                    src={post.picture} controls></video>):(
                      <img 
                      style={{width:'100%',borderRadius:'10px'}}
                      src={post.picture}  alt="" />
                    )
                  }
                  
                  </Link>
                  
                ))}
              </div>
            </div>
          </section>
          {/* Modal for Post Preview */}
          <Modal show={showModal} onClose={handleCloseModal}>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected Post"
                className="modal_image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
            )}
          </Modal>
        </>
      ) : (
        <p>Loading profile data...</p>
      )}
    </div>
  );
}

export default User;