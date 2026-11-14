import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(form.email, form.password)
      navigate(from, { replace: true })
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
      navigate(from, { replace: true })
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
          <i className="bi bi-cart3 text-warning me-2" />Welcome Back
        </h4>
        <p className="text-muted text-center small mb-3">Login to your SmartCart account</p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com" autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={set('password')} required placeholder="Your password" />
          </div>

          <button className="btn btn-primary-sc w-100 mb-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Login
          </button>
        </form>

        <div className="text-muted small text-center my-2">or</div>

        <button className="btn btn-outline-secondary w-100" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" className="me-2" alt="Google" />
          Continue with Google
        </button>

        <p className="text-center small mt-3 mb-0">
          New to SmartCart? <Link to="/register" className="text-warning fw-semibold">Create account</Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Login failed. Please try again.'
}
