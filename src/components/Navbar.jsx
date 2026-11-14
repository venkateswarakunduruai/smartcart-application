import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/authService'
import { useCart } from '../context/CartContext'
import { PRODUCT_CATEGORIES } from '../data/products'

export default function Navbar() {
  const { currentUser, userProfile, isAdmin } = useAuth()
  const { cartCount, totalItems } = useCart()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  // Live cart count: display numeric total or 0 when empty
  const displayCartCount = typeof cartCount === 'number' ? cartCount : (totalItems || 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('[Navbar] Logout error:', err)
    }
  }

  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Account'

  return (
    <nav className="sc-navbar navbar navbar-expand-lg sticky-top shadow-sm">
      <div className="container-fluid">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-cart3 me-2" />
          <span>SmartCart</span>
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler text-white border-secondary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapsible Navbar Section */}
        <div className="collapse navbar-collapse" id="navMenu">
          {/* Navigation Links: Home & Categories */}
          <ul className="navbar-nav me-lg-3 my-2 my-lg-0">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-1" to="/">
                <i className="bi bi-house-door" />
                <span>Home</span>
              </Link>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-grid" />
                <span>Categories</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li>
                  <Link className="dropdown-item" to="/">
                    <i className="bi bi-grid-fill me-2 text-warning" />
                    All Products
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider border-secondary" />
                </li>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <Link
                      className="dropdown-item"
                      to={`/?category=${encodeURIComponent(cat)}`}
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* Search bar – centered on desktop, full-width on mobile */}
          <form className="sc-search d-flex mx-auto my-2 my-lg-0 flex-grow-1" style={{ maxWidth: 540 }} onSubmit={handleSearch}>
            <input
              className="form-control px-3"
              placeholder="Search products, brands and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <i className="bi bi-search" />
            </button>
          </form>

          {/* Right Action Links (Cart + Authentication) */}
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 my-2 my-lg-0">
            {/* Live Shopping Cart Icon with Badge */}
            <li className="nav-item position-relative me-lg-2">
              <Link
                className="nav-link d-flex align-items-center gap-1 px-2"
                to="/cart"
                title="View Shopping Cart"
              >
                <i className="bi bi-cart2 fs-5" />
                <span className="d-inline d-lg-none ms-1">Cart</span>
                <span className="cart-badge">{displayCartCount}</span>
              </Link>
            </li>

            {/* Authenticated User Menu or Guest Links */}
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/orders">
                    <i className="bi bi-box-seam" />
                    <span>Orders</span>
                  </Link>
                </li>

                {isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link text-warning d-flex align-items-center gap-1" to="/admin">
                      <i className="bi bi-speedometer2" />
                      <span>Admin</span>
                    </Link>
                  </li>
                )}

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-5" />
                    <span className="d-none d-lg-inline">{displayName}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li className="dropdown-header text-muted small">
                      Signed in as <strong>{displayName}</strong>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2" />
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/orders">
                        <i className="bi bi-box-seam me-2" />
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/login">
                    <i className="bi bi-box-arrow-in-right" />
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-primary-sc ms-lg-1 px-3" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
