import React, { useState, useEffect } from 'react';
import Findpost from './Findpost';
function randomizeItems(array) {
  // Create a copy of the array to avoid mutating the original array
  const shuffledArray = [...array];

  // Implement the Fisher-Yates Shuffle Algorithm
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the elements at indices i and j
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}

function Post() {


    


  const [posts, setPosts] = useState([]); // State for posts fetched from the backend
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages

  // State to manage follow status, comments, and share modal for each post
  const [postStates, setPostStates] = useState({});
  const [shares, setShares] = useState([]);
  console.log(shares)
  // State to store the comment input for each post
  const [commentInputs, setCommentInputs] = useState({});
  console.log(posts)
  // Fetch posts from the backend when the component mounts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
        },
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setPosts(data);
      } else {
        throw new Error(data.message || 'Failed to fetch posts.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {

    fetchPosts();
  }, []);

  // Handle follow/unfollow button toggle
 

  // Handle share post
  // const handleSharePost = async (postId) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
  //       },
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       // Update the local state with the new share count
  //       setPosts((prevPosts) =>
  //         prevPosts.map((post) =>
  //           post._id === postId ? { ...post, shares: data.newShareCount } : post
  //         )
  //       );
  //     } else {
  //       throw new Error(data.message || 'Failed to share post.');
  //     }
  //   } catch (err) {
  //     console.error('Error sharing post:', err.message);
  //     alert('Failed to share post. Please try again.');
  //   }
  // };

  return (
    <div id="body_post">
      {/* Loading Indicator */}
      {loading && <p className="loading">Loading posts...</p>}

      {/* Error Message */}
      {error && (
        <div>
          <p className="error">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Posts Section */}
      <section id="section1_post">
        {posts.length > 0 ? (
          posts.map((post) => 

            
          
          <Findpost post={post} fetchPosts={fetchPosts}/>
           
          )
        ) : (
          <p style={{ textAlign: 'center', color: '#888', margin: '20px' }}>
            No posts available.
          </p>
        )}
      </section>
    </div>
  );
}

export default Post;