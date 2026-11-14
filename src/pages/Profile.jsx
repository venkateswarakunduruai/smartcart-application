import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/authService'

export default function Profile() {
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const startEdit = () => {
    setForm({
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
    })
    setMsg('')
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(currentUser.uid, form)
      await refreshProfile()
      setMsg('Profile updated successfully.')
      setEditing(false)
    } catch {
      setMsg('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const avatar = userProfile?.photoURL || currentUser?.photoURL

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          {avatar
            ? <img src={avatar} alt="avatar" className="rounded-circle" width={64} height={64} style={{ objectFit: 'cover' }} />
            : <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: 64, height: 64 }}>
                {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
              </div>
          }
          <div>
            <h5 className="mb-0 fw-bold">{userProfile?.displayName || 'SmartCart User'}</h5>
            <small className="text-muted">{currentUser?.email}</small>
            <div>
              <span className={`badge ${userProfile?.role === 'admin' ? 'bg-danger' : 'bg-secondary'} mt-1`}>
                {userProfile?.role || 'customer'}
              </span>
            </div>
          </div>
        </div>

        {msg && <div className="alert alert-info py-2 small">{msg}</div>}

        {!editing ? (
          <>
            <InfoRow icon="bi-envelope" label="Email" value={currentUser?.email} />
            <InfoRow icon="bi-telephone" label="Phone" value={userProfile?.phone || '—'} />
            <InfoRow icon="bi-geo-alt" label="Address" value={userProfile?.address || '—'} />
            <button className="btn btn-primary-sc mt-3" onClick={startEdit}>
              <i className="bi bi-pencil me-2" />Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <div className="mb-2">
              <label className="form-label small fw-semibold">Full Name</label>
              <input className="form-control" value={form.displayName}
                onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))} required />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-semibold">Phone</label>
              <input className="form-control" value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Address</label>
              <textarea className="form-control" rows={2} value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary-sc" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}Save
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="d-flex align-items-start gap-2 mb-2">
      <i className={`bi ${icon} text-warning mt-1`} />
      <div>
        <div className="small text-muted">{label}</div>
        <div className="fw-semibold">{value}</div>
      </div>
    </div>
  )
}
