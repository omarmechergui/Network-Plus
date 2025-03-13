import React, { useState, useEffect } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

// Step 1: Create a reusable Loading component
const Loading = () => {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
    </div>
  );
};

// Step 2: Main App Component
const Welcome = () => {
  const [loading, setLoading] = useState(true); // Initial loading state
  const {token}=useParams();
  const navigate =useNavigate()
  // Simulate fetching data after a delay
  useEffect( () => {
    const res= axios.post('http://localhost:5000/api/users/register/'+token)
    .then((res) => {
    if(res.status===200){
        setLoading(false);
        navigate('/');
    }})
    
  }, []);

  return (
    <div style={styles.appContainer}>
      {loading ? (
        <Loading /> // Show loading indicator while loading is true
      ) : (
    <>
    </>
      )}
    </div>
  );
};

// Step 3: Define styles (optional)
const styles = {
  appContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100px",
    height: "100px",
    border: "2px solid #ccc",
    borderRadius: "50%",
    position: "relative",
    overflow: "hidden",
  },
  spinner: {
    width: "40px",
    height: "40px",
    borderTop: "4px solid #3498db",
    borderRight: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  content: {
    textAlign: "center",
  },
};

// CSS keyframes for spinner animation
const root = document.documentElement;
root.style.setProperty("--spinner-animation", `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`);

export default Welcome;