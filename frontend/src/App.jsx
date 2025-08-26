import React,{useState,useEffect} from 'react'
import { Routes, Route ,Navigate} from 'react-router-dom'
import FrontPage from './pages/FrontPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import BookService from './pages/BookService'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import ChatButton from './components/ChatButton'
import axios from 'axios'

import './App.css'


function App() {
     const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {

      const token = localStorage.getItem('auth_token');
       const res = await fetch('http://localhost:5000/api/auth/profile', { credentials: 'include',headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } })
      const data= await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
 
  return (
    <>
        <Routes>
          <Route path="/" element={<FrontPage user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book" element={<BookService />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
           <Route path="/chat" element={<ChatButton user={user}/>}></Route>
        </Routes>
    </>
  )
}

export default App
