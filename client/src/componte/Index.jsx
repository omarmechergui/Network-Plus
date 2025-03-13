import React, { useState, useEffect } from 'react';
import Findvideo from './Findvideo';
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

function Index() {
  const [videos, setVideos] = useState([]); // State for video data fetched from the backend
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [userData, setUserData] = useState(null); // State for user profile data

  console.log(videos)

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
        setLoading(false);
        setVideos(randomizeItems(data));
        
      } else {
        throw new Error(data.message || 'Failed to fetch posts.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch video data from the backend when the component mounts
  useEffect(() => {
    fetchPosts();
    const fetchUserData = async () => {
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
  }, [])

  return (
    <div id="body_index">
      {/* Loading Indicator */}
      {loading && <p className="loading">Loading videos...</p>}

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Header */}
      <header id="header_index">
        <a href="/Following" className="header_link">
          <h2>following</h2>
        </a>
        <a href="/Everyone" className="header_link">
          <h2>everyone</h2>
        </a>
      </header>

      {/* Video Section */}
      <section id="section_index">
        {videos.length > 0 ? (
          videos.map((video, index) => (
              <Findvideo video={video} index={index} userData={userData} fetchPosts={fetchPosts}/>
           
          ))
        ) : (
          <p className="no_videos">No videos available.</p>
        )}
      </section>
    </div>
  );
}

export default Index;