import React,{useState,useEffect} from 'react'
import { Routes, Route ,Navigate} from 'react-router-dom'
import FrontPage from './pages/FrontPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import BookService from './pages/BookService'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminChat'
import ChatButton from './components/ChatButton'
import ProductsPage from "./pages/ProductsPage";
import BillingPage from './pages/BillingPage'; 
import SolarEstimate from "./pages/SolarEstimate";
import { useSelector } from 'react-redux'

import './App.css'
import DashboardPage from './pages/DashboardPage'


function App() {
     
  //const [loading, setLoading] = useState(true);

  const user=useSelector(state=>state.auth.user);
   
  //console.log(user);
 
  return (
    <>
        <Routes>
            <Route
              path="/dashboard/*"
              element={ <FrontPage user={user} /> }
            />

            <Route path="/dashboard/book" element={<BookService/>} />
            <Route
             path="/"
             element={<Login /> }
            />

            <Route
             path="/signup"
             element={<Signup /> }
            />

             Protected routes
            <Route
              path="/book"
              element={user ? <BookService /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/" />}
            />

            <Route
              path="/admin/*"
              element={ user?.userType==='admin' && <DashboardPage /> }
            />
            <Route
              path="/chat"
              element={user ? <ChatButton user={user} /> : <Navigate to="/" />}
            />

            <Route
               path="/dashboard/products"
               element={<ProductsPage />} />

            <Route
             path="/dashboard/solar-estimate"
              element={<SolarEstimate />} />

             <Route
          path="/products"
          element={<ProductsPage />}
        />
              <Route
          path="/billing"
          element={<BillingPage />}
        />


            
          </Routes>
          
    </>
  )
}

export default App
