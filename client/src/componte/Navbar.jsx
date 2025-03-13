import React, { useEffect, useState } from 'react';

function Navbar() {
  const [islog, setislog] = useState(false)
  const [userData, setUserData] = useState(null); // State for user profile data
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages


  useEffect(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:5000/api/users/getuser', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
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
    }, []);
  
  const handlelog = () => {
    localStorage.removeItem('token');
    setislog(false);
    setUserData(null);

  }
  return (
    <div id="body_nav">
      <footer>
        <form action="" method="get" id="form_nav">
          <a id="a_nav" href="/">
            <i className="fa-solid fa-house" />
            <p id="name">Home</p>
          </a>
          <a id="a_nav" href="/Post">
            <i className="fa-solid fa-image" />
            <p id="name">posts</p>
          </a>
          <a id="a_nav" href="/Search">
            <i className="fa-solid fa-search" />
            <p id="name">Search</p>
          </a>
          <a id="a_nav" href="/Add">
            <i className="fa-solid fa-plus" />
            <p id="name">Add</p>
          </a>
          <a id="a_nav" href="/Message">
            <i className="fa-solid fa-comments" />
            <p id="name">Message</p>
          </a>
          <a id="a_nav" href="/Profile">
            <i className="fa-solid fa-user" />
            <p id="name">Profile</p>
          </a>
        </form>
        <span id="span_nav">
          <hr
            style={{
              color: "#ffffff",
              height: 2,
              backgroundColor: "#ffffff",
              width: "100%",
              borderRadius: 1
            }}
          />
          {/* {islog ? (
            <a id="a_nav"  onClick={handlelog}>
              <i className="fa-solid fa-sign-out-alt" />
              <p id="name">Log Out</p>
            </a>
          ) : (
            <a href='/Login' id="a_nav"  onClick={handlelog}>
              <i className="fa-solid fa-sign-in-alt" />
              <p id="name">Log In</p>
            </a>
          )} */}
          {/* ---------------------- */}

          {userData ? (
            <a id="a_nav" onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior
              handlelog(); // Call the logout handler
            }}>
              <i className="fa-solid fa-sign-out-alt" aria-hidden="true" />
              <p id="name">Log Out</p>
            </a>
          ) : (
            <a href="/Login" id="a_nav" onClick={(e) => {
              // Optional: Add logic here if needed before navigation
              console.log("Navigating to Login");
            }}>
              <i className="fa-solid fa-sign-in-alt" aria-hidden="true" />
              <p id="name">Log In</p>
            </a>
          )}
          {/* ---------------------------- */}
          <a id="a_nav" href="/Notification">
            <i className="fa-solid fa-bell" />
            <p id="name">Notification</p>
          </a>
          <a id="a_nav" href="/Settings">
            <i className="fa-solid fa-cog" />
            <p id="name">Settings</p>
          </a>

        </span>
      </footer>
    </div>
  )
}

export default Navbar