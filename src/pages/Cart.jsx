import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { FALLBACK_IMAGE } from '../data/products'
import StarRating from '../components/StarRating'

export default function Cart() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    loading,
    error,
    // Compatibility aliases
    items,
    totalItems,
    totalPrice,
    cartLoading,
  } = useCart()

  const activeItems = cartItems || items || []
  const activeCount = typeof cartCount === 'number' ? cartCount : (totalItems || 0)
  const activeSubtotal = typeof cartTotal === 'number' ? cartTotal : (totalPrice || 0)
  const isLoading = loading || cartLoading

  // Delivery calculation: FREE for orders >= ₹499, otherwise ₹40
  const deliveryCharge = activeSubtotal >= 499 ? 0 : 40
  const finalTotal = activeSubtotal + deliveryCharge

  // Total savings across all discounted items in the cart
  const totalSavings = activeItems.reduce((sum, item) => {
    const origPrice = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price
    const itemQty = Number(item.qty || item.quantity) || 1
    return sum + (origPrice - item.price) * itemQty
  }, 0)

  // ── 1. Loading State ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning my-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="fw-semibold text-dark">Loading your shopping cart...</h5>
        <p className="text-muted small">Synchronizing items with your secure account</p>
      </div>
    )
  }

  // ── 2. Empty Cart State ────────────────────────────────────────────────────
  if (activeItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: 540 }}>
          <div className="mb-3">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4.5rem' }} />
          </div>
          <h4 className="fw-bold text-dark mb-2">Your cart is empty</h4>
          <p className="text-muted mb-4">
            Looks like you haven't added any products to your cart yet. Explore our top categories
            and start shopping today!
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-primary-sc px-4 py-2">
              <i className="bi bi-shop me-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. Active Shopping Cart View ───────────────────────────────────────────
  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
            <i className="bi bi-cart3 me-2 text-warning" />
            Shopping Cart
            <span className="badge bg-secondary ms-2 fs-6 fw-normal">
              {activeCount} {activeCount === 1 ? 'item' : 'items'}
            </span>
          </h4>
        </div>
        <button
          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
          onClick={clearCart}
          title="Remove all products from your cart"
        >
          <i className="bi bi-trash3" />
          <span>Clear Cart</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-octagon-fill me-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Cart Items List */}
        <div className="col-lg-8">
          {activeItems.map((item) => {
            const itemQty = Number(item.qty || item.quantity) || 1
            const itemSubtotal = item.price * itemQty
            const isMaxStock = itemQty >= item.stock

            return (
              <div key={item.id} className="card mb-3 border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <div className="row align-items-center g-3">
                    {/* Product Thumbnail */}
                    <div className="col-3 col-md-2 text-center">
                      <Link to={`/product/${item.id}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded border p-1"
                          style={{ maxHeight: 90, objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = FALLBACK_IMAGE
                          }}
                        />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="col-9 col-md-4">
                      {item.brand && (
                        <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: '0.75rem' }}>
                          {item.brand}
                        </small>
                      )}
                      <Link to={`/product/${item.id}`} className="text-dark fw-semibold text-decoration-none">
                        <span className="product-title mb-1 d-block">{item.name}</span>
                      </Link>

                      {item.rating && (
                        <div className="mb-1">
                          <StarRating rating={item.rating} reviews={item.reviews} />
                        </div>
                      )}

                      <div className="d-flex align-items-baseline gap-2 mt-1">
                        <span className="fw-bold text-danger fs-6">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-muted text-decoration-line-through small">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mt-1">
                        {item.stock <= 5 ? (
                          <small className="text-warning fw-semibold">
                            <i className="bi bi-exclamation-circle me-1" />
                            Only {item.stock} left in stock
                          </small>
                        ) : (
                          <small className="text-success fw-semibold">
                            <i className="bi bi-check-circle me-1" />
                            In Stock
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-6 col-md-3">
                      <small className="text-muted d-block mb-1">Quantity</small>
                      <div className="d-flex align-items-center border rounded bg-white" style={{ width: 'fit-content' }}>
                        <button
                          type="button"
                          className="btn btn-sm px-3 py-1 border-0"
                          onClick={() => decreaseQuantity(item.id)}
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <i className="bi bi-dash" />
                        </button>
                        <span className="px-3 fw-bold text-dark">{itemQty}</span>
                        <button
                          type="button"
                          className="btn btn-sm px-3 py-1 border-0"
                          onClick={() => increaseQuantity(item.id)}
                          disabled={isMaxStock}
                          title={isMaxStock ? 'Maximum stock reached' : 'Increase quantity'}
                          aria-label="Increase quantity"
                        >
                          <i className="bi bi-plus" />
                        </button>
                      </div>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                        Max limit: {item.stock}
                      </small>
                    </div>

                    {/* Item Subtotal & Remove Action */}
                    <div className="col-6 col-md-3 text-end">
                      <small className="text-muted d-block mb-1">Subtotal</small>
                      <div className="fw-bold fs-5 text-dark">
                        ₹{itemSubtotal.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0 mt-2 d-inline-flex align-items-center gap-1"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove product"
                      >
                        <i className="bi bi-trash3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3 text-dark">Order Summary</h5>

              {/* Free delivery callout */}
              {activeSubtotal < 499 ? (
                <div className="alert alert-warning py-2 px-3 small mb-3">
                  <i className="bi bi-info-circle me-1" />
                  Add <strong>₹{(499 - activeSubtotal).toLocaleString()}</strong> more to get{' '}
                  <strong className="text-success">FREE Delivery</strong>!
                </div>
              ) : (
                <div className="alert alert-success py-2 px-3 small mb-3">
                  <i className="bi bi-check2-circle me-1" />
                  Your order qualifies for <strong>FREE Delivery</strong>!
                </div>
              )}

              {/* Line items */}
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Items ({activeCount})</span>
                <span className="text-dark fw-semibold">₹{activeSubtotal.toLocaleString()}</span>
              </div>

              {totalSavings > 0 && (
                <div className="d-flex justify-content-between mb-2 small text-success">
                  <span>Total Discount</span>
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

              {/* Final Total */}
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <span className="fw-bold fs-5 text-dark">Order Total:</span>
                <span className="fw-bolder fs-4 text-danger">₹{finalTotal.toLocaleString()}</span>
              </div>

              {totalSavings > 0 && (
                <div className="badge bg-success-subtle text-success w-100 py-2 mb-3 text-wrap fw-semibold">
                  You are saving ₹{totalSavings.toLocaleString()} on this order!
                </div>
              )}

              {/* Action Buttons */}
              <Link to="/checkout" className="btn btn-primary-sc w-100 py-2 fw-semibold mb-2">
                <i className="bi bi-shield-lock me-2" />
                Proceed to Checkout
              </Link>

              <Link to="/" className="btn btn-outline-secondary w-100 py-2">
                <i className="bi bi-arrow-left me-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
