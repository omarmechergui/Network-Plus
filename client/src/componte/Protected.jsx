import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom';

function Protected({children}) {
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error messages
    const [userData, setUserData] = useState(null); // State for user profile data

    const location = useLocation();
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
     }, []);
    
    // Display loading indicator if data is not fetched yet
    if (loading) {
        return <p>Loading...</p>;
    }
    
    // Display error message if there is one
    if (error) {
       
        return <Navigate to="/Login" state={{ from: location }} replace={true} />;

    }
    
    // Display user profile data if data is fetched
    
  return children
}

export default Protected