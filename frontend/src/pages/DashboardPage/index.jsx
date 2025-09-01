import { useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { removeToken, logout } from "../../slice/AuthSlice";
import ChatWithMentor from "../../components/ChatWithMentor";
import AdminPanel from "../AdminChat";
import MentorDashboard from "../../components/MentorDashboard";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      to:'/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
      badge: "3",
    },
    {
      id: "chat",
      name: "chat",
      to:'/admin/chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      ),
      badge: "127",
    },
    {
      id: "interns",
      name: "Products",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      ),
      badge: "42",
    },
    // {
    //   id: "registration-request",
    //   name: "Registration",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    //       />
    //     </svg>
    //   ),
    //   badge: "8",
    // },
    // {
    //   id: "calendar",
    //   name: "Calendar",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    //       />
    //     </svg>
    //   ),
    // },
    // {
    //   id: "announcements",
    //   name: "Announcements",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    //       />
    //     </svg>
    //   ),
    //   badge: "2",
    // },
    // {
    //   id: "attendance",
    //   name: "Attendance",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    //       />
    //     </svg>
    //   ),
    // },
  ];

  const handleMenuClick = (menuId, path) => {
    setActiveMenu(menuId);
    if (path) navigate(path);
  };

  const getCurrentActiveMenu = () => {
    const path = location.pathname;
    const currentItem = menuItems.find((item) => item.to === path);
    return currentItem ? currentItem.id : "dashboard";
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        dispatch(removeToken());
        dispatch(logout());
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">EduPortal</h1>
                <p className="text-sm text-gray-500 font-medium">Learning Management</p>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 group"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = getCurrentActiveMenu() === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleMenuClick(item.id, item.to)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.01]"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  {/* Icon */}
                  <span
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label and Badge */}
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full ml-4">
                      <span className="text-sm font-semibold truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 rounded-full text-xs">
                          {item.badge}
                        </span>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group ${
              isCollapsed ? "justify-center" : ""
            }`}
            aria-label="Logout"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && (
              <span className="ml-4 text-sm font-semibold">Logout</span>
            )}
            
            {/* Logout tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-6 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                Logout
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
              <Routes>
                  <Route path="/" element={<AdminPanel/>}></Route>
                  <Route path="/chat" element={<MentorDashboard/>}></Route>
              </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;


// import { useState } from "react"
// import { useDispatch } from "react-redux"
// import {Route,Routes, useLocation} from 'react-router-dom'
// import { useNavigate } from "react-router-dom"
// import { removeToken,logout } from "../../slice/AuthSlice"




// const DashboardPage = ()=>{

//     const dispatch = useDispatch()
//     const [isCollapsed, setIsCollapsed] = useState(false)
//      const [activeMenu, setActiveMenu] = useState()
//     //const [expandedMenus, setExpandedMenus] = useState({})
//     const location = useLocation();
//    const navigate = useNavigate();

//   //   const toggleSubmenu = (menuId) => {
//   //   setExpandedMenus((prev) => ({
//   //     ...prev,
//   //     [menuId]: !prev[menuId],
//   //   }))
//   // }

//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed)
//   }

//   const menuItems = [
//     {
//       id: "dashboard",
//       name: "Dashboard",
//     //   to:"/dashboard",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
//           />
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
//           />
//         </svg>
//       ),
//       badge: "3",
//     },
//     {
//       id: "students",
//       name: "Students",
//     //   to:"/dashboard/all-students",
//       // icon:<UsersIcon className="w-6 h-6" />,
//       icon: (
//            <svg xmlns="http://www.w3.org/2000/svg"  className="w-6 h-6" fill="none" stroke="currentColor"  viewBox="0 0 24 24">
//                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
//            </svg>
//       ),
//       badge: "127"
//     },
//      {
//       id: "interns",
//       name: "Interns",
//     //   to:"/dashboard/all-interns",
//       icon: (
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                    <path
//                      strokeLinecap="round"
//                      strokeLinejoin="round"
//                      strokeWidth={2}
//                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
//                    />
//               </svg>
//       ),
//       badge: "127"
//     },
//     {
//       id: "registration-request",
//       name: "Registration",
//     //   to:"/dashboard/registration-request",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//           />
//         </svg>
//       ),
      
//     },
//     {
//       id: "calendar",
//       name: "Calendar",
//     //   to:"/dashboard/calendar",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//           />
//         </svg>
//       ),
//     },
//     {
//       id: "announcements",
//       name: "Announcements",
//     //   to:"/dashboard/announcement",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
//             />
//         </svg>
//       ),
//       badge: "2",
//     },
//     {
//       id: "attandence",
//       name: "Attandence",
//     //   to:"/dashboard/attandence",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//           />
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//         </svg>
//       ),
//     },
//   ]

//    const handleMenuClick = (menuId, path) => {
//     setActiveMenu(menuId)
//     navigate(path)
//   }

//   const getCurrentActiveMenu = () => {
//     const path = location.pathname
//     const currentItem = menuItems.find((item) => item.to === path)
//     return currentItem ? currentItem.id : "dashboard"
//   }


//     const handleLogout = async () => {
//     try {
//      const res= await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
//        if(res.ok)
//        {
//           dispatch(removeToken())
//           dispatch(logout())
//           navigate('/')
//        }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

 

// return (
//   <>

//  <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div
//         className={`${
//           isCollapsed ? "w-24" : "w-64"
//         } bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col border-r border-blue-100`}
//       >
//         {/* Logo and Company Name */}
//         <div className="flex items-center justify-between p-4 border-b border-blue-100">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                 />
//               </svg>
//             </div>
//             {!isCollapsed && (
//               <div>
//                 <h1 className="text-lg font-bold text-gray-800">EduPortal</h1>
//                 <p className="text-xs text-gray-500">Learning Management</p>
//               </div>
//             )}
//           </div>
//           <button
//             onClick={toggleSidebar}
//             className="p-1.5 ml-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//           >
//             <svg
//               className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
//             </svg>
//           </button>
//         </div>

//         {/* Menu Items */}
//         <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
//           {menuItems.map((item) => (
//              <div key={item.id}>
//                 <button
//                   key={item.id}
                
//                   onClick={ () => {
//                       // if (item.hasSubmenu && !isCollapsed) {
//                       //   toggleSubmenu(item.id)
//                       // } else {
//                         handleMenuClick(item.id,item.to)
                      
                     
//                     }}
//                   className={` flex items-center  p-2  rounded-lg transition-all duration-200 group relative ${
//                     getCurrentActiveMenu() === item.id
//                       ? "bg-blue-600 text-white shadow-lg"
//                       : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                   }  ${isCollapsed ? 'ml-3 p-3' : 'w-full'}` }
//                 >


//                             <span
//                               className={`flex-shrink-0 ${activeMenu === item.id ? "text-white" : "text-gray-500 group-hover:text-blue-600"}`}
//                             >
//                               {item.icon}
//                             </span>


//                             {!isCollapsed && (
//                               <div className="flex items-center justify-between w-full ml-3">
//                                 <span className="text-sm font-medium truncate">{item.name}</span>
//                                  <div className="flex items-center space-x-2">
//                                 {item.badge && (
//                                   <span
//                                     className={`px-2 py-0.5 text-xs font-bold rounded-full ${
//                                       activeMenu === item.id
//                                         ? "bg-white/20 text-white"
//                                         : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
//                                     }`}
//                                   >
//                                     {item.badge}
//                                   </span>
//                                 )}
//                               </div> 
//                               </div>
//                             )}



//                             { isCollapsed && (
//                               <div className="absolute left-16 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
//                                 {item.name}
//                                 {item.badge && <span className="ml-2 px-1.5 py-0.5 bg-blue-600 rounded text-xs">{item.badge}</span>}
//                                 {item.hasSubmenu && (
//                                   <div className="mt-2 pt-2 border-t border-gray-600">
//                                     {item.submenu.map((subItem) => (
//                                       <div key={subItem.id} className="py-1 text-xs text-gray-300">
//                                         • {subItem.name}
//                                         {subItem.badge && <span className="ml-1 text-blue-400">({subItem.badge})</span>}
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//              </button>  
//           </div>
//           ))}
//         </nav>

//         {/* Account and Logout */}
//         <div className="border-t border-blue-100 p-4">
          
       

//           {/* Logout Button */}
//           <button
//              onClick={handleLogout}
//             className={`w-full flex items-center px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group ${
//               isCollapsed ? "justify-center" : ""
//             }`}
//           >
//             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//               />
//             </svg>
//             {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
//             {isCollapsed && (
//               <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
//                 Logout
//               </div>
//             )}
//           </button>
//         </div>
//       </div>
//              <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
        

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
//           <div className="max-w-7xl mx-auto">
//                {

                
//                }
//           </div>
//         </main>
//       </div>     
//     </div> 
//     </>
//     )
// }

// export default DashboardPage;