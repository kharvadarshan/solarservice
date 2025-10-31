"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CountUp from "../../components/CountUp"
import api from "../../api"
import { MediaViewerDialog } from "../../components/MediaViewerDialog"
import { Button } from "../../components/ui/button"




export default function AdminPanel() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [uploadingQuotation, setUploadingQuotation] = useState(null)
  const [mediaDialog, setMediaDialog] = useState({
    open: false,
    url: "",
    type: "image",
    title: "",
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/bookings"),
      ])

      const statsData = statsRes.data
      const usersData = usersRes.data
      const bookingsData = bookingsRes.data

      if (statsData.success) setStats(statsData.stats)
      if (usersData.success) setUsers(usersData.users)
      if (bookingsData.success) setBookings(bookingsData.bookings)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }


  


  // const updateBookingStatus = async (bookingId, status) => {
  //   try {
  //     const res = await api.put(`/api/admin/bookings/${bookingId}`, {
  //       body: JSON.stringify({ status }),
  //     })
  //     if (res.data.success) {
  //       loadDashboardData() // Reload data
  //     }
  //   } catch (error) {
  //     console.error("Failed to update booking:", error)
  //   }
  // }


  const updateBookingStatus = async (bookingId, status) => {
  try {
    const res = await api.put(`/api/bookings/${bookingId}/status`, {
      status: status
    });
    if (res.data.success) {
      loadDashboardData(); // Reload data
    }
  } catch (error) {
    console.error("Failed to update booking:", error);
  }
}


// File upload handler
const handleFileUpload = async (event, bookingId) => {
  const file = event.target.files[0];
  
  if (!file) {
    console.log('No file selected');
    return;
  }

  console.log('File selected:', {
    name: file.name,
    type: file.type,
    size: file.size,
    bookingId: bookingId
  });

  // Validate file type
  if (file.type !== 'application/pdf') {
    alert('Please select a PDF file. Selected file type: ' + file.type);
    event.target.value = ''; // Clear the input
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB. Selected file size: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
    event.target.value = ''; // Clear the input
    return;
  }

  // Upload the file
  await uploadQuotation(bookingId, file);
  
  // Clear the input after upload
  event.target.value = '';
};

// Upload quotation function
const uploadQuotation = async (bookingId, file) => {
  try {
    setUploadingQuotation(bookingId); // Set uploading state
    
    const formData = new FormData();
    formData.append('quotationPdf', file);

    const res = await api.post(`/api/bookings/${bookingId}/quotation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (res.data.success) {
      loadDashboardData(); // Reload data to show updated quotation
      alert('Quotation uploaded successfully!');
    }
  } catch (error) {
    console.error("Failed to upload quotation:", error);
    alert('Failed to upload quotation: ' + (error.response?.data?.message || error.message));
  } finally {
    setUploadingQuotation(null); // Reset uploading state
  }
};

// Download quotation function
const downloadQuotation = async (bookingId, bookingName) => {
  try {
    const res = await api.get(`/api/bookings/${bookingId}/quotation`, {
      responseType: 'blob' // Important for file downloads
    });
    
    // Create blob and download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation-${bookingName}-${bookingId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Failed to download quotation:", error);
    alert('Failed to download quotation: ' + (error.response?.data?.message || error.message));
  }
};

// Delete quotation function
const deleteQuotation = async (bookingId) => {
  if (!confirm('Are you sure you want to delete this quotation?')) {
    return;
  }
  
  try {
    const res = await api.delete(`/api/bookings/${bookingId}/quotation`);
    if (res.data.success) {
      loadDashboardData(); // Reload data to remove quotation display
      alert('Quotation deleted successfully!');
    }
  } catch (error) {
    console.error("Failed to delete quotation:", error);
    alert('Failed to delete quotation: ' + (error.response?.data?.message || error.message));
  }
};


  // In your AdminPanel component

const extractFilename = (filePath) => {
  if (!filePath) return null;
  
  // Handle various path formats
  if (filePath.includes('/')) {
    return filePath.split('/').pop();
  }
  if (filePath.includes('\\')) {
    return filePath.split('\\').pop();
  }
  // If it's already just a filename, return as is
  return filePath;
}

const getThumbnailUrl = (filePath) => {
  const filename = extractFilename(filePath);
  if (!filename) return "/placeholder.svg";
  
  return `http://localhost:5000/api/uploads/${filename}`;
}

const openMediaViewer = (filePath, type, title) => {
  const filename = extractFilename(filePath);
  if (!filename) return;
  
  const apiUrl = `http://localhost:5000/api/uploads/${filename}`;
  
  setMediaDialog({
    open: true,
    url: apiUrl,
    type,
    title,
  });
}
 
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full p-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">☀</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SolarTech Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="w-full p-6">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "bookings", label: "Bookings" },
              { id: "users", label: "Users" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="w-full p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        <CountUp from={0} to={stats.totalUsers} duration={1} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        <CountUp from={0} to={stats.totalBookings} duration={1} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        <CountUp from={0} to={stats.pendingBookings} duration={1} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        <CountUp from={0} to={stats.recentBookings} duration={1} />
                      </p>
                    </div>
                  </div>
                </div>
                {/* Add these additional stat cards if needed */}
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center">
    <div className="p-2 bg-purple-100 rounded-lg">
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Survey Scheduled</p>
      <p className="text-2xl font-semibold text-gray-900">
        <CountUp from={0} to={stats.surveyBookings || 0} duration={1} />
      </p>
    </div>
  </div>
</div>

<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center">
    <div className="p-2 bg-blue-100 rounded-lg">
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-6 4h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Quoted</p>
      <p className="text-2xl font-semibold text-gray-900">
        <CountUp from={0} to={stats.quotedBookings || 0} duration={1} />
      </p>
    </div>
  </div>
</div>
              </div>
              
            )}

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Electricity Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Panel Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pricing
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Quotation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        {/* Customer Info */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{booking.phone}</div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">{booking.address}</div>
                          <div className="text-sm text-gray-500">PIN: {booking.pincode}</div>
                        </td>

                        {/* Electricity Details */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            ₹{booking.electricityBill?.toLocaleString()}/month
                          </div>
                          <div className="text-sm text-gray-500">{booking.serviceProvider}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {booking.billingCycle?.replace("-", " ")}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">
                            Power: {booking.calculatedPower} kW
                          </div>
                        </td>

                        {/* Panel Type */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.selectedPanelType?.name}</div>
                          <div className="text-sm text-gray-500">{booking.selectedPanelType?.wattPeak} Wp</div>
                          <div className="text-sm text-gray-500">{booking.selectedPanelType?.plates} plates</div>
                          <div className="text-sm text-gray-500">{booking.selectedPanelType?.requiredPower} kW</div>
                          <div className="text-sm font-medium text-gray-700 mt-1">
                            ₹{booking.selectedPanelType?.price?.toLocaleString()}
                          </div>
                        </td>

                        {/* Company Details */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.selectedCompany?.name}</div>
                          <div className="text-sm text-gray-500">Rating: {booking.selectedCompany?.rating}/5 ⭐</div>
                          <div className="text-sm text-gray-500">ROI: {booking.selectedCompany?.roi}</div>
                          <div className="text-sm text-gray-500">Break Even: {booking.selectedCompany?.breakEven}</div>
                        </td>

                        {/* Pricing */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              Tentative: ₹{booking.selectedCompany?.tentativeAmount?.toLocaleString()}
                            </div>
                            <div className="text-green-600">
                              Subsidy: -₹{booking.selectedCompany?.subsidyAmount?.toLocaleString()}
                            </div>
                            <div className="font-bold text-gray-900 mt-1">
                              Effective: ₹{booking.selectedCompany?.effectiveAmount?.toLocaleString()}
                            </div>
                          </div>
                        </td>
                          <td className="px-4 py-4">
  <div className="space-y-2">
    {booking.electricityBillImage && (
      <div className="flex items-center gap-2">
        <img
          src={getThumbnailUrl(booking.electricityBillImage)}
          alt="Bill preview"
          className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
          onClick={() =>
            openMediaViewer(
              booking.electricityBillImage,
              "image",
              `${booking.name} - Electricity Bill`,
            )
          }
        />
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 bg-transparent"
            onClick={() =>
              openMediaViewer(
                booking.electricityBillImage,
                "image",
                `${booking.name} - Electricity Bill`,
              )
            }
          >
            View Bill
          </Button>
        </div>
      </div>
    )}
    {booking.siteVideo && (
      <div className="flex items-center gap-2">
        <video
          src={getThumbnailUrl(booking.siteVideo)}
          className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
          onClick={() =>
            openMediaViewer(booking.siteVideo, "video", `${booking.name} - Site Video`)
          }
        />
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 bg-transparent"
            onClick={() =>
              openMediaViewer(booking.siteVideo, "video", `${booking.name} - Site Video`)
            }
          >
            View Video
          </Button>
        </div>
      </div>
    )}
    {!booking.electricityBillImage && !booking.siteVideo && (
      <span className="text-xs text-gray-400">No documents</span>
    )}
  </div>
</td>

      
         

                        {/* Status */}
                         <td className="px-4 py-4 whitespace-nowrap">
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      booking.status === "installation"
        ? "bg-green-100 text-green-800"
        : booking.status === "quoted"
        ? "bg-blue-100 text-blue-800"
        : booking.status === "survey"
        ? "bg-purple-100 text-purple-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
  </span>
</td> 
      <td className="px-4 py-4">
  <div className="space-y-2">
    {booking.quotationPdf ? (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">PDF</span>
          </div>
          <div className="text-xs text-gray-600">
            Uploaded: {new Date(booking.quotationUploadedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => downloadQuotation(booking._id, booking.name)}
          >
            Download
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs h-7"
            onClick={() => deleteQuotation(booking._id)}
          >
            Delete
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        {uploadingQuotation === booking._id ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-xs text-gray-600">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Visible file input for testing */}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e, booking._id)}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              id={`quotation-upload-${booking._id}`}
            />
            <div className="text-xs text-gray-500">Max file size: 10MB</div>
          </div>
        )}
      </div>
    )}
  </div>
</td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleTimeString()}
                          </div>
                        </td>

                        {/* Actions */}
                           <td className="px-4 py-4 whitespace-nowrap">
  <select
    value={booking.status}
    onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 capitalize"
  >
    <option value="pending">Pending</option>
    <option value="survey">Survey</option>
    <option value="quoted">Quoted</option>
    <option value="installation">Installation</option>
  </select>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                  <p className="mt-1 text-sm text-gray-500">No bookings have been made yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <MediaViewerDialog
        open={mediaDialog.open}
        onOpenChange={(open) => setMediaDialog({ ...mediaDialog, open })}
        mediaUrl={mediaDialog.url}
        mediaType={mediaDialog.type}
        title={mediaDialog.title}
      />
    </div>
  )
}


// "use client"

// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import CountUp from "../../components/CountUp"
// import api from "../../api"
// import { MediaViewerDialog } from "./components/media-viewer-dialog"
// import { Button } from "@/components/ui/button"

// export default function AdminPanel() {
//   const navigate = useNavigate()
//   const [stats, setStats] = useState<any>(null)
//   const [users, setUsers] = useState<any[]>([])
//   const [bookings, setBookings] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("dashboard")
//   const [mediaDialog, setMediaDialog] = useState<{
//     open: boolean
//     url: string
//     type: "image" | "video"
//     title: string
//   }>({
//     open: false,
//     url: "",
//     type: "image",
//     title: "",
//   })

//   useEffect(() => {
//     loadDashboardData()
//   }, [])

//   const loadDashboardData = async () => {
//     try {
//       const [statsRes, usersRes, bookingsRes] = await Promise.all([
//         api.get("/api/admin/stats"),
//         api.get("/api/admin/users"),
//         api.get("/api/admin/bookings"),
//       ])

//       const statsData = statsRes.data
//       const usersData = usersRes.data
//       const bookingsData = bookingsRes.data

//       if (statsData.success) setStats(statsData.stats)
//       if (usersData.success) setUsers(usersData.users)
//       if (bookingsData.success) setBookings(bookingsData.bookings)
//     } catch (error) {
//       console.error("Failed to load dashboard data:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateBookingStatus = async (bookingId: string, status: string) => {
//     try {
//       const res = await api.put(`/api/admin/bookings/${bookingId}`, {
//         body: JSON.stringify({ status }),
//       })
//       if (res.data.success) {
//         loadDashboardData() // Reload data
//       }
//     } catch (error) {
//       console.error("Failed to update booking:", error)
//     }
//   }

//   const openMediaViewer = (url: string, type: "image" | "video", title: string) => {
//     setMediaDialog({
//       open: true,
//       url,
//       type,
//       title,
//     })
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-xl">Loading admin panel...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold">☀</span>
//               </div>
//               <span className="text-xl font-bold text-gray-900">SolarTech Admin</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation */}
//       <nav className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex space-x-8">
//             {[
//               { id: "dashboard", label: "Dashboard" },
//               { id: "bookings", label: "Bookings" },
//               { id: "users", label: "Users" },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === tab.id
//                     ? "border-orange-500 text-orange-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>

//       {/* Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === "dashboard" && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

//             {/* Stats Grid */}
//             {stats && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Users</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.totalUsers} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-green-100 rounded-lg">
//                       <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Bookings</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.totalBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-yellow-100 rounded-lg">
//                       <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Pending</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.pendingBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-purple-100 rounded-lg">
//                       <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.recentBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Recent Bookings */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Customer
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Address
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {bookings.slice(0, 5).map((booking) => (
//                       <tr key={booking._id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{booking.name}</div>
//                           <div className="text-sm text-gray-500">{booking.email}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.address}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               booking.status === "completed"
//                                 ? "bg-green-100 text-green-800"
//                                 : booking.status === "confirmed"
//                                   ? "bg-blue-100 text-blue-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                             }`}
//                           >
//                             {booking.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(booking.createdAt).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "bookings" && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>

//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Customer Info
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Contact
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Location
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Electricity Details
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Panel Type
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Company Details
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Pricing
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Documents
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {bookings.map((booking) => (
//                       <tr key={booking._id} className="hover:bg-gray-50">
//                         {/* Customer Info */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm font-medium text-gray-900">{booking.name}</div>
//                           <div className="text-sm text-gray-500">{booking.email}</div>
//                         </td>

//                         {/* Contact */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm text-gray-900">{booking.phone}</div>
//                         </td>

//                         {/* Location */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm text-gray-900 max-w-xs">{booking.address}</div>
//                           <div className="text-sm text-gray-500">PIN: {booking.pincode}</div>
//                         </td>

//                         {/* Electricity Details */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm text-gray-900">
//                             ₹{booking.electricityBill?.toLocaleString()}/month
//                           </div>
//                           <div className="text-sm text-gray-500">{booking.serviceProvider}</div>
//                           <div className="text-sm text-gray-500 capitalize">
//                             {booking.billingCycle?.replace("-", " ")}
//                           </div>
//                           <div className="text-sm font-medium text-gray-700 mt-1">
//                             Power: {booking.calculatedPower} kW
//                           </div>
//                         </td>

//                         {/* Panel Type */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm font-medium text-gray-900">{booking.selectedPanelType?.name}</div>
//                           <div className="text-sm text-gray-500">{booking.selectedPanelType?.wattPeak} Wp</div>
//                           <div className="text-sm text-gray-500">{booking.selectedPanelType?.plates} plates</div>
//                           <div className="text-sm text-gray-500">{booking.selectedPanelType?.requiredPower} kW</div>
//                           <div className="text-sm font-medium text-gray-700 mt-1">
//                             ₹{booking.selectedPanelType?.price?.toLocaleString()}
//                           </div>
//                         </td>

//                         {/* Company Details */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm font-medium text-gray-900">{booking.selectedCompany?.name}</div>
//                           <div className="text-sm text-gray-500">Rating: {booking.selectedCompany?.rating}/5 ⭐</div>
//                           <div className="text-sm text-gray-500">ROI: {booking.selectedCompany?.roi}</div>
//                           <div className="text-sm text-gray-500">Break Even: {booking.selectedCompany?.breakEven}</div>
//                         </td>

//                         {/* Pricing */}
//                         <td className="px-4 py-4">
//                           <div className="text-sm text-gray-900">
//                             <div className="font-medium">
//                               Tentative: ₹{booking.selectedCompany?.tentativeAmount?.toLocaleString()}
//                             </div>
//                             <div className="text-green-600">
//                               Subsidy: -₹{booking.selectedCompany?.subsidyAmount?.toLocaleString()}
//                             </div>
//                             <div className="font-bold text-gray-900 mt-1">
//                               Effective: ₹{booking.selectedCompany?.effectiveAmount?.toLocaleString()}
//                             </div>
//                           </div>
//                         </td>

//                         <td className="px-4 py-4">
//                           <div className="space-y-2">
//                             {booking.electricityBillImage && (
//                               <div className="flex items-center gap-2">
//                                 <img
//                                   src={booking.electricityBillImage || "/placeholder.svg"}
//                                   alt="Bill preview"
//                                   className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
//                                   onClick={() =>
//                                     openMediaViewer(
//                                       booking.electricityBillImage,
//                                       "image",
//                                       `${booking.name} - Electricity Bill`,
//                                     )
//                                   }
//                                 />
//                                 <div className="flex flex-col gap-1">
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     className="text-xs h-7 bg-transparent"
//                                     onClick={() =>
//                                       openMediaViewer(
//                                         booking.electricityBillImage,
//                                         "image",
//                                         `${booking.name} - Electricity Bill`,
//                                       )
//                                     }
//                                   >
//                                     View Bill
//                                   </Button>
//                                 </div>
//                               </div>
//                             )}
//                             {booking.siteVideo && (
//                               <div className="flex items-center gap-2">
//                                 <video
//                                   src={booking.siteVideo}
//                                   className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
//                                   onClick={() =>
//                                     openMediaViewer(booking.siteVideo, "video", `${booking.name} - Site Video`)
//                                   }
//                                 />
//                                 <div className="flex flex-col gap-1">
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     className="text-xs h-7 bg-transparent"
//                                     onClick={() =>
//                                       openMediaViewer(booking.siteVideo, "video", `${booking.name} - Site Video`)
//                                     }
//                                   >
//                                     View Video
//                                   </Button>
//                                 </div>
//                               </div>
//                             )}
//                             {!booking.electricityBillImage && !booking.siteVideo && (
//                               <span className="text-xs text-gray-400">No documents</span>
//                             )}
//                           </div>
//                         </td>

//                         {/* Status */}
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <span
//                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               booking.status === "confirmed"
//                                 ? "bg-green-100 text-green-800"
//                                 : booking.status === "rejected"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                             }`}
//                           >
//                             {booking.status}
//                           </span>
//                         </td>

//                         {/* Date */}
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {new Date(booking.createdAt).toLocaleDateString()}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {new Date(booking.createdAt).toLocaleTimeString()}
//                           </div>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-4 py-4 whitespace-nowrap">
//                           <select
//                             value={booking.status}
//                             onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
//                             className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
//                           >
//                             <option value="pending">Pending</option>
//                             <option value="confirmed">Confirmed</option>
//                             <option value="rejected">Rejected</option>
//                           </select>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Empty State */}
//               {bookings.length === 0 && (
//                 <div className="text-center py-12">
//                   <svg
//                     className="mx-auto h-12 w-12 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                     />
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
//                   <p className="mt-1 text-sm text-gray-500">No bookings have been made yet.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === "users" && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

//             <div className="bg-white rounded-lg shadow">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Email
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Role
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Joined
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {users.map((user) => (
//                       <tr key={user._id}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(user.createdAt).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       <MediaViewerDialog
//         open={mediaDialog.open}
//         onOpenChange={(open) => setMediaDialog({ ...mediaDialog, open })}
//         mediaUrl={mediaDialog.url}
//         mediaType={mediaDialog.type}
//         title={mediaDialog.title}
//       />
//     </div>
//   )
// }



// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import CountUp from '../../components/CountUp';
// import api from '../../api';
// export default function AdminPanel() {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('dashboard');

//    useEffect(()=>{
//       loadDashboardData();
//    },[])

//   const loadDashboardData = async () => {
//     try {
//       const [statsRes, usersRes, bookingsRes] = await Promise.all([
//         api.get('/api/admin/stats'),
//         api.get('/api/admin/users'),
//         api.get('/api/admin/bookings')
//       ]);

//       // const [statsData, usersData, bookingsData] = await Promise.all([
//       //   statsRes.json(),
//       //   usersRes.json(),
//       //   bookingsRes.json()
//       // ]);

//       const statsData = statsRes.data;
//     const usersData = usersRes.data;
//     const bookingsData = bookingsRes.data;


     

//       if (statsData.success) setStats(statsData.stats);
//       if (usersData.success) setUsers(usersData.users);
//       if (bookingsData.success) setBookings(bookingsData.bookings);
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateBookingStatus = async (bookingId, status) => {
//     try {
//       const res = await api.put(`/api/admin/bookings/${bookingId}`, {
//         body: JSON.stringify({ status })
//       });
//       if (res.data.success) {
//         loadDashboardData(); // Reload data
//       }
//     } catch (error) {
//       console.error('Failed to update booking:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-xl">Loading admin panel...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold">☀</span>
//               </div>
//               <span className="text-xl font-bold text-gray-900">SolarTech Admin</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation */}
//       <nav className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex space-x-8">
//             {[
//               { id: 'dashboard', label: 'Dashboard' },
//               { id: 'bookings', label: 'Bookings' },
//               { id: 'users', label: 'Users' }
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === tab.id
//                     ? 'border-orange-500 text-orange-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>

//       {/* Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === 'dashboard' && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            
//             {/* Stats Grid */}
//             {stats && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Users</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.totalUsers} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-green-100 rounded-lg">
//                       <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Bookings</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.totalBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-yellow-100 rounded-lg">
//                       <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Pending</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.pendingBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-purple-100 rounded-lg">
//                       <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
//                       <p className="text-2xl font-semibold text-gray-900">
//                         <CountUp from={0} to={stats.recentBookings} duration={1} />
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Recent Bookings */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {bookings.slice(0, 5).map((booking) => (
//                       <tr key={booking._id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{booking.name}</div>
//                           <div className="text-sm text-gray-500">{booking.email}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.address}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             booking.status === 'completed' ? 'bg-green-100 text-green-800' :
//                             booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
//                             'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {booking.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(booking.createdAt).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'bookings' && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            
//             <div className="bg-white rounded-lg shadow">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {bookings.map((booking) => (
//                       <tr key={booking._id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{booking.name}</div>
//                           <div className="text-sm text-gray-500">{booking.email}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.address}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             booking.status === 'completed' ? 'bg-green-100 text-green-800' :
//                             booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
//                             'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {booking.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(booking.createdAt).toLocaleDateString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <select
//                             value={booking.status}
//                             onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
//                             className="border border-gray-300 rounded px-2 py-1 text-sm"
//                           >
//                             <option value="pending">Pending</option>
//                             <option value="confirmed">Confirmed</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </select>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'users' && (
//           <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            
//             <div className="bg-white rounded-lg shadow">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {users.map((user) => (
//                       <tr key={user._id}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(user.createdAt).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
