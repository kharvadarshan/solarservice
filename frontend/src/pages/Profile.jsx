import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function BookingProgress({ steps = [] }) {
  if (!Array.isArray(steps) || steps.length === 0) return null

  const total = steps.length
  const currentIndex = steps.findIndex(s => s.status === 'in_progress')
  const lastDoneIndex = steps.reduce((acc, s, i) => (s.status === 'done' ? i : acc), -1)
  const activeIndex = currentIndex >= 0 ? currentIndex : lastDoneIndex
  const progressPercent = total > 1 ? Math.max(0, activeIndex) / (total - 1) * 100 : 0

  return (
    <div className="w-full">
      <div className="relative mt-2 mb-8">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        <div className="relative flex justify-between">
          {steps.map((s, idx) => {
            const isCompleted = s.status === 'done' || idx < activeIndex
            const isCurrent = idx === activeIndex && (s.status === 'in_progress' || s.status === 'pending')
            const circleBase = 'relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shadow-sm'
            const circleClass = isCompleted
              ? 'bg-blue-600 text-white'
              : isCurrent
              ? 'bg-white text-blue-600 border-2 border-blue-600 ring-4 ring-blue-100 animate-pulse'
              : 'bg-gray-200 text-gray-600'
            return (
              <div key={s.key || idx} className="flex flex-col items-center" title={s.title} aria-label={s.title}>
                <div className={`${circleBase} ${circleClass}`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="mt-2 text-xs text-gray-800 text-center w-24 leading-snug hidden sm:block">{s.title}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {steps.map((s, idx) => (
          <div key={s.key || idx} className="text-xs">
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {s.status === 'done' ? (
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              ) : s.status === 'in_progress' ? (
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              ) : (
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-gray-300"></span>
              )}
              <span>{s.title}</span>
            </div>
            <div className="text-gray-600 mt-0.5">{s.description}</div>
            {s.completedAt && (
              <div className="text-gray-500 mt-0.5">{new Date(s.completedAt).toLocaleDateString()}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [bookings, setBookings] = useState([])
  const [bookingsError, setBookingsError] = useState('')

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load profile')
        setUser(data.user)
      } catch (e) {
        setError(e.message)
      }
    }
    fetchMe()
  }, [])

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/my', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load bookings')
        setBookings(data.bookings)
      } catch (e) {
        setBookingsError(e.message)
      }
    }
    loadBookings()
  }, [])

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'U'
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    navigate('/')
  }

  if (error) return (
    <div className="pt-16 p-6">
      <div className="max-w-xl mx-auto bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
        {error}
      </div>
    </div>
  )

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
              <Link to="/" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors">Back to Home</Link>
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

        {/* Bookings Timeline */}
        <div className="mt-8 bg-white shadow rounded-2xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
            <Link to="/book" className="text-sm text-orange-600 hover:underline">+ New Booking</Link>
          </div>
          {bookingsError ? (
            <div className="text-red-600">{bookingsError}</div>
          ) : bookings.length === 0 ? (
            <div className="text-gray-600">No bookings yet.</div>
          ) : (
            <div className="space-y-6">
              {bookings.map((b) => (
                <div key={b._id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div>
                      <div className="font-semibold text-gray-900">{b.address}</div>
                      <div className="text-sm text-gray-600">Preferred: {new Date(b.preferredDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge status={b.status} />
                      <div className="text-gray-500">Created: {new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <BookingProgress steps={b.steps} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 