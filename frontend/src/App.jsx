import React from 'react'
import { Routes, Route } from 'react-router-dom'
import FrontPage from './pages/FrontPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import BookService from './pages/BookService'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import './App.css'

function App() {
 
  return (
    <>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book" element={<BookService />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
    </>
  )
}

export default App
