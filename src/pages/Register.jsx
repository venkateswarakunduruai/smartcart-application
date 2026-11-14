import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail, loginWithGoogle } from '../services/authService'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await registerWithEmail(form)
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page d-flex align-items-center justify-content-center py-5">
      <div className="auth-card card shadow-sm p-4">
        <h4 className="mb-1 fw-bold text-center">
          <i className="bi bi-cart3 text-warning me-2" />Create Account
        </h4>
        <p className="text-muted text-center small mb-3">Join SmartCart today</p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Full Name</label>
            <input className="form-control" value={form.displayName} onChange={set('displayName')} required placeholder="John Doe" />
          </div>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com" />
          </div>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Phone (optional)</label>
            <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+91 9999999999" />
          </div>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={set('password')} required placeholder="Min 6 characters" />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Confirm Password</label>
            <input className="form-control" type="password" value={form.confirm} onChange={set('confirm')} required placeholder="Repeat password" />
          </div>

          <button className="btn btn-primary-sc w-100 mb-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Create Account
          </button>
        </form>

        <div className="divider-text text-muted small text-center my-2">or</div>

        <button className="btn btn-outline-secondary w-100" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" className="me-2" alt="Google" />
          Continue with Google
        </button>

        <p className="text-center small mt-3 mb-0">
          Already have an account? <Link to="/login" className="text-warning fw-semibold">Login</Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password is too weak.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
