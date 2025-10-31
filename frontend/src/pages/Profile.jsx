import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { logout,removeToken } from '../slice/AuthSlice'
import {toast} from "sonner"
import { Button } from '../components/ui/button'
import { MediaViewerDialog } from '../components/MediaViewerDialog'

function StatusBadge({ status }) {
  const map = {
    pending: { text: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    confirmed: { text: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    completed: { text: 'Completed', cls: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { text: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200' }
  }
  const m = map[status] || { text: status, cls: 'bg-gray-50 text-gray-700 border-gray-200' }
  return <span className={`px-2.5 py-1 rounded-full text-xs border ${m.cls}`}>{m.text}</span>
}

export default function Profile() {
  const navigate = useNavigate()
  const dispatch=useDispatch();
  const user = useSelector(state=>state.auth.user);
  const [loggingOut, setLoggingOut] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsError, setBookingsError] = useState('');
  const [activeTab, setActiveTab] = useState('requested');
  const [isLoading,setIsLoading] = useState(false);

  const [mediaDialog, setMediaDialog] = useState({
    open: false,
    url: "",
    type: "image",
    title: "",
  })

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get('/api/bookings/my')
       
        
        if (!res.data.success) throw new Error(res.data?.error || 'Failed to load bookings')
        setBookings(res.data.bookings)
      } catch (e) {
        setBookingsError(e.message)
      }
    }
    loadBookings()
  }, []);


  console.log("Bookings:",bookings);


 

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
     
      alert('Quotation deleted successfully!');
    }
  } catch (error) {
    console.error("Failed to delete quotation:", error);
    alert('Failed to delete quotation: ' + (error.response?.data?.message || error.message));
  }
};

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


  const checkoutHandler = async(amount)=>{

    setIsLoading(true);

    try {
     const { data:keyData} = await api.get("/api/v1/getKey");
     console.log(keyData);
     const { key } = keyData;
     console.log(key); 

     const { data:orderData } = await api.post("/api/v1/payment/process",{
      amount
     });

     console.log(orderData);
     const { order } = orderData;
     console.log(order);


     const options = {
        key: key, // Replace with your Razorpay key_id
        amount: amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: 'INR',
        name: 'Acme Corp',
        description: 'Test Transaction',
        order_id: order.id, // This is the order_id created in the backend
        handler: async function(response) {
          try {
           const verifyResponse =  await api.post("/api/v1/payment/paymentVerification", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if(verifyResponse.data.success)
            {
              navigate('/payment-success');
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
          //  toast.error("Payment verification failed");
          toast("error","Payment Verification Failed...!");
           navigate("/payment-failed");
          }
        }, // Your success URL
        prefill: {
          name: 'Darshan Kharva',
          email: 'darshan.kharva11@gmail.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }catch(error)
    {
            console.error("Payment Error:", error);
    }
    finally{
      setIsLoading(false);
    }

  }

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'U'
  }

 


  const renderBookingTable = (bookingsList) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Electricity Details</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Panel Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Details</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th> */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>

          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookingsList.map((booking) => (
            <tr key={booking._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(booking.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="font-medium text-gray-900">{booking.name}</div>
                <div className="text-gray-500 text-xs">{booking.email}</div>
                <div className="text-gray-500 text-xs">{booking.phone}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                <div className="truncate" title={booking.address}>{booking.address}</div>
                <div className="text-xs text-gray-500">PIN: {booking.pincode}</div>
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
              {/* <td className="px-4 py-4 text-sm">
                <div className="font-medium text-gray-900">{booking.calculatedPower} kW</div>
                <div className="text-xs text-gray-500">{booking.selectedPanelType?.name}</div>
                <div className="text-xs text-gray-500">{booking.selectedPanelType?.wattPeak}W × {booking.selectedPanelType?.plates}</div>
              </td> */}
              {/* <td className="px-4 py-4 text-sm">
                <div className="font-medium text-gray-900">{booking.selectedCompany?.name}</div>
                <div className="text-xs text-gray-500">Rating: {booking.selectedCompany?.rating}/5</div>
              </td> */}

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

             

              
              {/* <td className="px-4 py-4 text-sm">
                <div className="text-xs">
                  <div className="text-gray-600">Tentative: <span className="font-medium">₹{booking.selectedCompany?.tentativeAmount?.toLocaleString()}</span></div>
                  <div className="text-green-600">Subsidy: <span className="font-medium">₹{booking.selectedCompany?.subsidyAmount?.toLocaleString()}</span></div>
                  <div className="text-orange-600">Effective: <span className="font-medium">₹{booking.selectedCompany?.effectiveAmount?.toLocaleString()}</span></div>
                  <div className="text-gray-600">ROI: <span className="font-medium">{booking.selectedCompany?.roi}</span></div>
                </div>
              </td> */}
              <td className="px-4 py-4 text-sm">

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
                        null    
                    </div>
                  )}
                </div>
                {/* <div className="flex flex-col gap-1">
                  {booking.electricityBillImage && (
                    <span className="text-xs text-green-600">✓ Bill</span>
                  )}
                  {booking.siteVideo && (
                    <span className="text-xs text-green-600">✓ Video</span>
                  )}
                  {!booking.electricityBillImage && !booking.siteVideo && (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </div> */}
              </td>
              {/* <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={booking.status} />
              </td> */}
              <td>
                <button onClick={()=>checkoutHandler(200)}>Pay</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderEmptyState = (tab) => {
    const emptyStates = {
      'requested': {
        icon: '⏳',
        title: 'No requested bookings',
        description: 'Your new booking requests will appear here while waiting for approval.'
      },
      'in-progress': {
        icon: '🚀',
        title: 'No bookings in progress',
        description: 'Your confirmed bookings will appear here once they are approved.'
      },
      'completed': {
        icon: '✅',
        title: 'No completed bookings',
        description: 'Your completed solar installations will be shown here.'
      },
      'incomplete': {
        icon: '❌',
        title: 'No incomplete bookings',
        description: 'Any rejected or cancelled bookings will appear here.'
      }
    }

    const state = emptyStates[tab.id]
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{state.icon}</div>
        <div className="text-gray-600 text-lg mb-2">{state.title}</div>
        <div className="text-gray-500">{state.description}</div>
      </div>
    )
  }

  const handleLogout = async () => {
   
    try {
      const res=await api.post('/api/auth/logout')
       if(res.data.ok){
                 
                  dispatch(logout());
                  dispatch(removeToken());
                  navigate('/')
            }
    } catch(error) {
      console.log(error);
    }
  }

  if (!user) return <div className="pt-16 p-6">Loading...</div>

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center text-2xl font-bold">
                {getInitials(user.name)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 break-words">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors">Back to Home</Link>
              <button onClick={handleLogout} disabled={loggingOut} className="px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-60">
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Account</div>
              <div className="mt-2 font-semibold text-gray-900">Active</div>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Email</div>
              <div className="mt-2 font-semibold text-gray-900">{user.email}</div>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Member</div>
              <div className="mt-2 font-semibold text-gray-900">Since 2025</div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Your session is secured with an httpOnly cookie. For API calls, we also store a token locally for client-side interactions.
          </div>
        </div>

        {/* Bookings with Tabs */}
        <div className="mt-8 bg-white shadow rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
            <Link to="/book" className="text-sm text-orange-600 hover:underline">+ New Booking</Link>
          </div>
          
          {bookingsError ? (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{bookingsError}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <div className="text-gray-600 text-lg mb-2">No bookings yet</div>
              <div className="text-gray-500">Start your solar journey by creating a new booking</div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {(() => {
                 

                  return renderBookingTable(bookings);
                })()}
              </div>
            </>
          )}
        </div>
      </div>
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

// import { useEffect, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import api from '../api'
// import { useDispatch, useSelector } from 'react-redux'
// import { logout,removeToken } from '../slice/AuthSlice'


// function StatusBadge({ status }) {
  
//   const map = {
//     pending: { text: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
//     confirmed: { text: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
//     completed: { text: 'Completed', cls: 'bg-green-50 text-green-700 border-green-200' },
//     cancelled: { text: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200' }
//   }
//   const m = map[status] || { text: status, cls: 'bg-gray-50 text-gray-700 border-gray-200' }
//   return <span className={`px-2.5 py-1 rounded-full text-xs border ${m.cls}`}>{m.text}</span>
// }

// export default function Profile() {
//   const navigate = useNavigate()
//   const dispatch=useDispatch();
//   const user = useSelector(state=>state.auth.user)
//   const [loggingOut, setLoggingOut] = useState(false)
//   const [bookings, setBookings] = useState([])
//   const [bookingsError, setBookingsError] = useState('')
//   const [activeTab, setActiveTab] = useState('requested')

//   useEffect(() => {
//     const loadBookings = async () => {
//       try {
//         const res = await api.get('/api/bookings/my')
       
        
//         if (!res.data.success) throw new Error(res.data?.error || 'Failed to load bookings')
//         setBookings(res.data.bookings)
//       } catch (e) {
//         setBookingsError(e.message)
//       }
//     }
//     loadBookings()
//   }, [])

//   const getInitials = (name = '') => {
//     return name
//       .split(' ')
//       .filter(Boolean)
//       .slice(0, 2)
//       .map(part => part[0]?.toUpperCase())
//       .join('') || 'U'
//   }

//   const getBookingsByStatus = (status) => {
//     switch(status) {
//       case 'requested':
//         return bookings.filter(b => b.status === 'pending');
//       case 'in-progress':
//         return bookings.filter(b => b.status === 'confirmed');
//       case 'completed':
//         return bookings.filter(b => b.status === 'completed');
//       case 'incomplete':
//         return bookings.filter(b => b.status === 'rejected');
//       default:
//         return [];
//     }
//   }

//   const tabs = [
//     { 
//       id: 'requested', 
//       label: 'Requested', 
//       icon: '⏳', 
//       count: getBookingsByStatus('requested').length,
//       color: 'yellow'
//     },
//     { 
//       id: 'in-progress', 
//       label: 'In Progress', 
//       icon: '🚀', 
//       count: getBookingsByStatus('in-progress').length,
//       color: 'blue'
//     },
//     { 
//       id: 'completed', 
//       label: 'Completed', 
//       icon: '✅', 
//       count: getBookingsByStatus('completed').length,
//       color: 'green'
//     },
//     { 
//       id: 'incomplete', 
//       label: 'Incomplete', 
//       icon: '❌', 
//       count: getBookingsByStatus('incomplete').length,
//       color: 'red'
//     }
//   ]

//   const renderBookingCard = (booking) => (
//     <div key={booking._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
//         <div className="flex-1">
//           <div className="font-semibold text-gray-900">{booking.address}</div>
//           <div className="text-sm text-gray-600">
//             {booking.selectedCompany?.name && (
//               <span>Company: {booking.selectedCompany.name} • </span>
//             )}
//             {booking.selectedPanelType?.name && (
//               <span>Panel: {booking.selectedPanelType.name} • </span>
//             )}
//             {booking.calculatedPower && (
//               <span>Power: {booking.calculatedPower} kW</span>
//             )}
//           </div>
//           {booking.electricityBill && (
//             <div className="text-sm text-gray-500 mt-1">
//               Bill Amount: ₹{booking.electricityBill} • Service: {booking.serviceProvider}
//             </div>
//           )}
//         </div>
//         <div className="flex items-center gap-3 text-sm">
//           <StatusBadge status={booking.status} />
//           <div className="text-gray-500">
//             {new Date(booking.createdAt).toLocaleDateString()}
//           </div>
//         </div>
//       </div>
      
//       {/* Booking Details */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//         <div>
//           <span className="text-gray-600">Name:</span>
//           <div className="font-medium">{booking.name}</div>
//         </div>
//         <div>
//           <span className="text-gray-600">Email:</span>
//           <div className="font-medium">{booking.email}</div>
//         </div>
//         <div>
//           <span className="text-gray-600">Phone:</span>
//           <div className="font-medium">{booking.phone}</div>
//         </div>
//       </div>

//       {/* File uploads status */}
//       {(booking.electricityBillImage || booking.siteVideo) && (
//         <div className="mt-3 pt-3 border-t border-gray-100">
//           <div className="text-sm text-gray-600 mb-2">📎 Uploaded Documents:</div>
//           <div className="flex gap-4 text-sm">
//             {booking.electricityBillImage && (
//               <span className="text-green-600">✓ Electricity Bill</span>
//             )}
//             {booking.siteVideo && (
//               <span className="text-green-600">✓ Site Video</span>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Company details if confirmed */}
//       {booking.status === 'confirmed' && booking.selectedCompany && (
//         <div className="mt-3 pt-3 border-t border-gray-100">
//           <div className="text-sm text-gray-600 mb-2">💰 Investment Details:</div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//             <div>
//               <span className="text-gray-600">Tentative:</span>
//               <div className="font-medium">₹{booking.selectedCompany.tentativeAmount?.toLocaleString()}</div>
//             </div>
//             <div>
//               <span className="text-gray-600">Subsidy:</span>
//               <div className="font-medium text-green-600">₹{booking.selectedCompany.subsidyAmount?.toLocaleString()}</div>
//             </div>
//             <div>
//               <span className="text-gray-600">Effective:</span>
//               <div className="font-medium text-orange-600">₹{booking.selectedCompany.effectiveAmount?.toLocaleString()}</div>
//             </div>
//             <div>
//               <span className="text-gray-600">ROI:</span>
//               <div className="font-medium">{booking.selectedCompany.roi}</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )

//   const renderEmptyState = (tab) => {
//     const emptyStates = {
//       'requested': {
//         icon: '⏳',
//         title: 'No requested bookings',
//         description: 'Your new booking requests will appear here while waiting for approval.'
//       },
//       'in-progress': {
//         icon: '🚀',
//         title: 'No bookings in progress',
//         description: 'Your confirmed bookings will appear here once they are approved.'
//       },
//       'completed': {
//         icon: '✅',
//         title: 'No completed bookings',
//         description: 'Your completed solar installations will be shown here.'
//       },
//       'incomplete': {
//         icon: '❌',
//         title: 'No incomplete bookings',
//         description: 'Any rejected or cancelled bookings will appear here.'
//       }
//     }

//     const state = emptyStates[tab.id]
//     return (
//       <div className="text-center py-12">
//         <div className="text-6xl mb-4">{state.icon}</div>
//         <div className="text-gray-600 text-lg mb-2">{state.title}</div>
//         <div className="text-gray-500">{state.description}</div>
//       </div>
//     )
//   }

//   const handleLogout = async () => {
   
//     try {
//       const res=await api.post('/api/auth/logout')
//        if(res.data.ok){
                 
//                   dispatch(logout());
//                   dispatch(removeToken());
//                   navigate('/')
//             }
//     } catch(error) {
//       console.log(error);
//     }
//   }

//   // if (error) return (
//   //   <div className="pt-16 p-6">
//   //     <div className="max-w-xl mx-auto bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
//   //       {error}
//   //     </div>
//   //   </div>
//   // )

//   if (!user) return <div className="pt-16 p-6">Loading...</div>

//   return (
//     <div className="pt-16 px-4 sm:px-6 lg:px-8 py-10">
//       <div className="w-full mx-auto">
//         <div className="bg-white shadow-xl rounded-2xl p-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//             <div className="flex items-center gap-4">
//               <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center text-2xl font-bold">
//                 {getInitials(user.name)}
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
//                 <p className="text-gray-600 break-words">{user.email}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Link to="/dashboard" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors">Back to Home</Link>
//               <button onClick={handleLogout} disabled={loggingOut} className="px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-60">
//                 {loggingOut ? 'Logging out...' : 'Logout'}
//               </button>
//             </div>
//           </div>

//           <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="rounded-xl border border-gray-200 p-6">
//               <div className="text-sm text-gray-500">Account</div>
//               <div className="mt-2 font-semibold text-gray-900">Active</div>
//             </div>
//             <div className="rounded-xl border border-gray-200 p-6">
//               <div className="text-sm text-gray-500">Email</div>
//               <div className="mt-2 font-semibold text-gray-900">{user.email}</div>
//             </div>
//             <div className="rounded-xl border border-gray-200 p-6">
//               <div className="text-sm text-gray-500">Member</div>
//               <div className="mt-2 font-semibold text-gray-900">Since 2025</div>
//             </div>
//           </div>

//           <div className="mt-6 text-sm text-gray-500">
//             Your session is secured with an httpOnly cookie. For API calls, we also store a token locally for client-side interactions.
//           </div>
//         </div>

//         {/* Bookings with Tabs */}
//         <div className="mt-8 bg-white shadow rounded-2xl p-8">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
//             <Link to="/book" className="text-sm text-orange-600 hover:underline">+ New Booking</Link>
//           </div>
          
//           {bookingsError ? (
//             <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{bookingsError}</div>
//           ) : bookings.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">📋</div>
//               <div className="text-gray-600 text-lg mb-2">No bookings yet</div>
//               <div className="text-gray-500">Start your solar journey by creating a new booking</div>
//             </div>
//           ) : (
//             <>
//               {/* Tabs */}
//               <div className="border-b border-gray-200 mb-6">
//                 <nav className="-mb-px flex space-x-8">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//                         activeTab === tab.id
//                           ? `border-${tab.color}-500 text-${tab.color}-600`
//                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                       }`}
//                     >
//                       <span>{tab.icon}</span>
//                       <span>{tab.label}</span>
//                       <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
//                         activeTab === tab.id
//                           ? `bg-${tab.color}-100 text-${tab.color}-600`
//                           : 'bg-gray-100 text-gray-600'
//                       }`}>
//                         {tab.count}
//                       </span>
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               {/* Tab Content */}
//               <div className="min-h-[400px]">
//                 {(() => {
//                   const currentBookings = getBookingsByStatus(activeTab);
//                   const currentTab = tabs.find(tab => tab.id === activeTab);
                  
//                   if (currentBookings.length === 0) {
//                     return renderEmptyState(currentTab);
//                   }

//                   return (
//                     <div className="space-y-4">
//                       {currentBookings.map(renderBookingCard)}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// } 