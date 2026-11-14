import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orderService'
import { FALLBACK_IMAGE } from '../data/products'

export default function Checkout() {
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const { cartItems, cartTotal, cartCount, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(null)

  // Form state pre-filled from user profile if available
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('COD')

  useEffect(() => {
    if (userProfile || currentUser) {
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || userProfile?.displayName || currentUser?.displayName || '',
        phone: prev.phone || userProfile?.phone || '',
        street: prev.street || userProfile?.address || '',
      }))
    }
  }, [userProfile, currentUser])

  const activeItems = cartItems || []
  const subtotal = Number(cartTotal) || 0
  const deliveryCharge = subtotal >= 499 ? 0 : 40
  const finalTotal = subtotal + deliveryCharge

  const totalSavings = activeItems.reduce((sum, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price
    const itemQty = Number(item.qty || item.quantity) || 1
    return sum + (origPrice - item.price) * itemQty
  }, 0)

  const handleInputChange = (field) => (e) => {
    setShipping((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setError('')

    if (!activeItems || activeItems.length === 0) {
      setError('Your shopping cart is empty.')
      return
    }

    if (!shipping.fullName || !shipping.phone || !shipping.street || !shipping.city || !shipping.pincode) {
      setError('Please fill in all required shipping address fields.')
      return
    }

    setLoading(true)
    try {
      const orderPayload = {
        userId: currentUser.uid,
        customerName: shipping.fullName,
        customerEmail: currentUser.email,
        phone: shipping.phone,
        shippingAddress: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          street: shipping.street,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
        },
        items: activeItems,
        subtotal,
        deliveryCharge,
        discount: totalSavings,
        total: finalTotal,
        paymentMethod,
      }

      const result = await createOrder(orderPayload)
      // Clear the shopping cart
      await clearCart()

      // Set order success state to show confirmation
      setOrderSuccess({
        orderId: result.orderId,
        total: finalTotal,
        itemsCount: cartCount,
        paymentMethod,
        shipping,
      })
    } catch (err) {
      console.error('[Checkout] Order placement error:', err)
      setError('Failed to place your order. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Order Confirmation View ───────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-4 p-md-5 mx-auto" style={{ maxWidth: 620 }}>
          <div className="mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4.5rem' }} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Order Placed Successfully!</h3>
          <p className="text-muted mb-4">
            Thank you for shopping with <strong>SmartCart</strong>. Your order is confirmed and will be delivered soon.
          </p>

          <div className="bg-light rounded-3 p-3 text-start mb-4 border">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Order ID:</span>
              <strong className="text-dark font-monospace small">{orderSuccess.orderId}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Total Paid/Payable:</span>
              <strong className="text-danger">₹{orderSuccess.total.toLocaleString()}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Payment Mode:</span>
              <span className="badge bg-secondary">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted small">Estimated Delivery:</span>
              <span className="text-success fw-semibold small">Within 3–5 Business Days</span>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/orders" className="btn btn-primary-sc px-4 py-2">
              <i className="bi bi-box-seam me-2" />
              View My Orders
            </Link>
            <Link to="/" className="btn btn-outline-secondary px-4 py-2">
              <i className="bi bi-shop me-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty Cart View ───────────────────────────────────────────────────────
  if (!activeItems || activeItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-cart-x text-muted mb-3" style={{ fontSize: '3.5rem' }} />
          <h4 className="fw-bold">Your cart is empty</h4>
          <p className="text-muted mb-4">Please add products to your cart before proceeding to checkout.</p>
          <Link to="/" className="btn btn-primary-sc">
            <i className="bi bi-shop me-2" />
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  // ── Checkout Form View ────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      <div className="mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-shield-lock me-2 text-warning" />
          Secure Checkout
        </h4>
        <small className="text-muted">Review your items and enter shipping details to complete your order</small>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="col-lg-7">
            {/* 1. Delivery Address Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                  <span className="badge bg-warning text-dark me-2 rounded-circle" style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  Delivery Address
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={shipping.fullName}
                      onChange={handleInputChange('fullName')}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mobile Phone (10 digits) *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={shipping.phone}
                      onChange={handleInputChange('phone')}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Street Address / House No. *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Flat, House no., Building, Apartment, Area"
                      value={shipping.street}
                      onChange={handleInputChange('street')}
                      required
                    />
                  </div>

                  <div className="col-md-5">
                    <label className="form-label small fw-semibold">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      value={shipping.city}
                      onChange={handleInputChange('city')}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">State</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      value={shipping.state}
                      onChange={handleInputChange('state')}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">PIN Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="6 digits"
                      value={shipping.pincode}
                      onChange={handleInputChange('pincode')}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                  <span className="badge bg-warning text-dark me-2 rounded-circle" style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  Payment Method
                </h5>

                <div className="d-flex flex-column gap-2">
                  <label className={`card p-3 border cursor-pointer ${paymentMethod === 'COD' ? 'border-warning bg-warning bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                          <i className="bi bi-cash-stack text-success fs-5" />
                          Cash on Delivery (COD)
                        </div>
                        <small className="text-muted">Pay in cash or UPI when your order is delivered</small>
                      </div>
                    </div>
                  </label>

                  <label className={`card p-3 border cursor-pointer ${paymentMethod === 'UPI' ? 'border-warning bg-warning bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                          <i className="bi bi-qr-code text-primary fs-5" />
                          UPI / QR Code (Instant Mock Payment)
                        </div>
                        <small className="text-muted">Pay securely via Google Pay, PhonePe, Paytm or BHIM</small>
                      </div>
                    </div>
                  </label>

                  <label className={`card p-3 border cursor-pointer ${paymentMethod === 'CARD' ? 'border-warning bg-warning bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-check-input mt-0"
                      />
                      <div>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                          <i className="bi bi-credit-card text-danger fs-5" />
                          Credit / Debit Card (Mock Online Payment)
                        </div>
                        <small className="text-muted">Visa, MasterCard, RuPay and American Express</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3 text-dark">Order Summary</h5>

                {/* Items preview list */}
                <div className="mb-3 pe-1" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {activeItems.map((item) => (
                    <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: '75%' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="rounded border"
                          style={{ width: 40, height: 40, objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = FALLBACK_IMAGE
                          }}
                        />
                        <div className="text-truncate">
                          <div className="small fw-semibold text-truncate">{item.name}</div>
                          <small className="text-muted">Qty: {item.qty || item.quantity || 1}</small>
                        </div>
                      </div>
                      <span className="fw-bold small">
                        ₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal, delivery, discount, total */}
                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="text-dark fw-semibold">₹{subtotal.toLocaleString()}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Discount</span>
                    <span>− ₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2 small text-muted">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    <span className="text-dark fw-semibold">₹40</span>
                  )}
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="fw-bold fs-5 text-dark">Grand Total:</span>
                  <span className="fw-bolder fs-4 text-danger">₹{finalTotal.toLocaleString()}</span>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  className="btn btn-primary-sc w-100 py-3 fw-bold fs-6 shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-bag-check-fill me-2" />
                      Place Order • ₹{finalTotal.toLocaleString()}
                    </>
                  )}
                </button>

                <div className="text-center text-muted small d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-shield-check text-success fs-5" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
