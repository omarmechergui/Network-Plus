import { Route, Routes, useLocation } from 'react-router-dom';
import './layout.css';
import './App.css';
import Navbar from './componte/Navbar';
import Index from './componte/Index';
import Message from './componte/Message';
import Post from './componte/Post';
import Profile from './componte/Profile';
import User from './componte/User';
import Notification from './componte/Notification';

import Messagenotification from './componte/Messagenotification';
import Editprofile from './componte/Editprofile';
import Settings from './componte/Settings';
import Sersh from './componte/Sersh';
import { useEffect } from 'react';
import Aos from 'aos';
import Login from './componte/login/Login';
import Siginin from './componte/login/Rejister';
import Forgrt_password from './componte/login/Forgrt_password';
import New_password from './componte/login/New_password';
import Sigin_in_verif_email from './componte/login/Sigin_in_verif_email';
import Welcome from './componte/Welcome';
import AddPost from './componte/AddPost';
import Openpost from './componte/Openpost';
import Protected from './componte/Protected';

function App() {
  const url = useLocation();

  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });
  }, []);

  const isAuthPage =
    url.pathname === '/Contact' ||
    url.pathname === '/Login' ||
    url.pathname === '/Siginin' ||
    url.pathname === '/New_password' ||
    url.pathname === '/Forgrt_password' ||
    url.pathname === '/Sigin_in_verif_email' ||
    url.pathname.startsWith('/verify/');

  return (
    <div className="np-app-container">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/Post" element={<Post />} />
        <Route
          path="/Message"
          element={
            <Protected>
              <Messagenotification />
            </Protected>
          }
        >
          <Route index element={<Message />} />
          <Route path="/Message/Notification" element={<Notification />} />
        </Route>
        
        {/* Direct Route to Notification for consistency */}
        <Route
          path="/Notification"
          element={
            <Protected>
              <Messagenotification />
            </Protected>
          }
        />

        <Route path="/Settings" element={<Settings />} />
        <Route
          path="/Profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/Editprofile"
          element={
            <Protected>
              <Editprofile />
            </Protected>
          }
        />
        <Route path="/Search" element={<Sersh />} />
        <Route
          path="/User/:id"
          element={
            <Protected>
              <User />
            </Protected>
          }
        />
        <Route path="/Login" element={<Login />} />
        <Route path="/Siginin" element={<Siginin />} />
        <Route path="/Forgrt_password" element={<Forgrt_password />} />
        <Route path="/New_password" element={<New_password />} />
        <Route path="/Sigin_in_verif_email" element={<Sigin_in_verif_email />} />
        <Route path="/verify/:token" element={<Welcome />} />
        <Route
          path="/Add"
          element={
            <Protected>
              <AddPost />
            </Protected>
          }
        />
        <Route
          path="/Openpost/:postId"
          element={
            <Protected>
              <Openpost />
            </Protected>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
