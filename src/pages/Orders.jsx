import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/orderService'
import { FALLBACK_IMAGE } from '../data/products'

export default function Orders() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) return

    const loadOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const userOrders = await getUserOrders(currentUser.uid)
        setOrders(userOrders)
      } catch (err) {
        console.error('[Orders] Failed to load orders:', err)
        setError('Failed to load your order history. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [currentUser])

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning my-3" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
        <h5 className="fw-semibold text-dark">Loading your orders...</h5>
      </div>
    )
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: 500 }} role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2" />
          <span>{error}</span>
        </div>
        <Link to="/" className="btn btn-outline-secondary mt-2">Back to Home</Link>
      </div>
    )
  }

  // ── Empty Orders State ────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: 540 }}>
          <div className="mb-3">
            <i className="bi bi-box-seam text-muted" style={{ fontSize: '4rem' }} />
          </div>
          <h4 className="fw-bold text-dark mb-2">No orders placed yet</h4>
          <p className="text-muted mb-4">
            You haven't placed any orders with SmartCart yet. Explore our 35 top-rated products and start shopping!
          </p>
          <div>
            <Link to="/" className="btn btn-primary-sc px-4 py-2">
              <i className="bi bi-shop me-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Orders List View ──────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
            <i className="bi bi-box-seam me-2 text-warning" />
            My Orders
            <span className="badge bg-secondary ms-2 fs-6 fw-normal">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </h4>
          <small className="text-muted">Track and review your past orders and deliveries</small>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-arrow-left" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="d-flex flex-column gap-4">
        {orders.map((order) => {
          // Format creation date
          let dateStr = 'Recent'
          if (order.createdAt?.toDate) {
            dateStr = order.createdAt.toDate().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          } else if (order.createdDate) {
            dateStr = new Date(order.createdDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          }

          return (
            <div key={order.id} className="card border-0 shadow-sm">
              {/* Order Header */}
              <div className="card-header bg-light border-bottom p-3">
                <div className="row g-2 align-items-center">
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Order Placed</span>
                    <span className="fw-semibold small text-dark">{dateStr}</span>
                  </div>

                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Order Total</span>
                    <span className="fw-bold text-danger">₹{Number(order.total).toLocaleString()}</span>
                  </div>

                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Ship To</span>
                    <span className="fw-semibold small text-dark text-truncate d-block">
                      {order.shippingAddress?.fullName || order.customerName || 'Customer'}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 text-md-end">
                    <span className="text-muted small d-block">Order ID</span>
                    <span className="font-monospace small fw-bold text-dark">{order.orderId || order.id}</span>
                  </div>
                </div>
              </div>

              {/* Order Body */}
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                      <i className="bi bi-check2-circle me-1" />
                      Status: {order.orderStatus || 'Placed'}
                    </span>
                    <span className="badge bg-light text-dark border px-2 py-2 small">
                      Payment: {order.paymentMethod || 'COD'} ({order.paymentStatus || 'Pending'})
                    </span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-truck me-1" /> Estimated delivery within 3–5 days
                  </small>
                </div>

                {/* Items in this order */}
                <div className="d-flex flex-column gap-3">
                  {(order.items || []).map((item, idx) => (
                    <div key={`${order.id}-${item.id || idx}`} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <Link to={`/product/${item.id}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rounded border p-1"
                            style={{ width: 64, height: 64, objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = FALLBACK_IMAGE
                            }}
                          />
                        </Link>
                        <div>
                          <Link to={`/product/${item.id}`} className="fw-semibold text-dark text-decoration-none">
                            {item.name}
                          </Link>
                          <div className="small text-muted mt-1">
                            Price: ₹{Number(item.price).toLocaleString()} × {item.qty || item.quantity || 1}
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="fw-bold text-dark">
                          ₹{(Number(item.price) * (item.qty || item.quantity || 1)).toLocaleString()}
                        </span>
                        <div>
                          <Link to={`/product/${item.id}`} className="btn btn-sm btn-outline-warning mt-1 py-0 px-2" style={{ fontSize: '0.78rem' }}>
                            Buy Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Details */}
                {order.shippingAddress?.street && (
                  <div className="mt-4 pt-3 border-top small text-muted">
                    <i className="bi bi-geo-alt-fill text-warning me-1" />
                    <strong>Delivery Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode} (Phone: {order.shippingAddress.phone})
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
