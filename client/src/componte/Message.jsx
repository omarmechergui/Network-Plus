import React, { useEffect, useState } from 'react'
import Contact from './Contact'

function Message() {
  const [contacts,setcontacts]=useState([])
  const [userData, setUserData] = useState(null); // State for user profile data
  const [talk, settalk]=useState("")
  const fetchcontacts=async()=>{
    const response=await fetch('http://localhost:5000/api/users/contacts', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
      }})
    const data=await response.json()
    setcontacts(data.contacts)
  }
  const fetchUserData = async () => {
    try {
      
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
      console.log(err);
      
    } 
  };
  useEffect(()=>{
    fetchcontacts()
    fetchUserData()
  },[])
  console.log(contacts);
  
  return (
    <div style={{display:"flex"}}>
 <div style={{width:"35%"}}>    
  <section id="section1_msg">
    {contacts.map((contact) => (
  <div key={contact._id}>
    <a onClick={()=>settalk(contact._id)} style={{cursor:"pointer"}}>
      <span>
        <img
          src={contact.profilePicture}
          alt=""
        />
        <br />
      </span>
      <span>
        <h2 id="username">{contact.username}</h2>
        <p>hello</p>
      </span>
    </a>
  </div>
))}
    
  </section>
  </div> 
  <div style={{width:"65%"}}>
    <Contact talk={talk} userId={userData?._id}/>
  </div>


    </div>
  )
}

export default Message