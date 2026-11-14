import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductById, PRODUCTS, FALLBACK_IMAGE } from '../data/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { addToCart, items } = useCart()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState('')

  // Reset quantity and scroll to top when opening a new or related product
  useEffect(() => {
    setQty(1)
    setMsg('')
    window.scrollTo(0, 0)
  }, [id])

  const product = getProductById(id)

  if (!product) {
    return (
      <div className="container text-center py-5">
        <i className="bi bi-exclamation-circle display-4 text-muted" />
        <p className="mt-3">Product not found.</p>
        <Link to="/" className="btn btn-primary-sc">Back to Home</Link>
      </div>
    )
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  const inCart = items.find((i) => i.id === product.id)
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAdd = async () => {
    if (!currentUser) { navigate('/login'); return }
    setAdding(true)
    const result = await addToCart(product, qty)
    setMsg(result.error || `Added ${qty} item${qty > 1 ? 's' : ''} to cart!`)
    setTimeout(() => setMsg(''), 3000)
    setAdding(false)
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 200 }}>{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Image */}
        <div className="col-md-5">
          <div className="bg-white rounded-3 p-4 text-center border">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid"
              style={{ maxHeight: 340, objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = FALLBACK_IMAGE
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="col-md-7">
          <p className="text-muted small mb-1">{product.brand}</p>
          <h4 className="fw-bold mb-2">{product.name}</h4>
          <StarRating rating={product.rating} reviews={product.reviews} />

          <div className="my-3">
            <span className="fs-3 fw-bold text-danger">₹{product.price.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-muted text-decoration-line-through ms-2">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="badge bg-success ms-2">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-muted">{product.description}</p>

          {/* Stock */}
          <p className="mb-3">
            {product.stock > 5
              ? <span className="text-success fw-semibold"><i className="bi bi-check-circle me-1" />In Stock</span>
              : product.stock > 0
                ? <span className="text-warning fw-semibold"><i className="bi bi-exclamation-circle me-1" />Only {product.stock} left</span>
                : <span className="text-danger fw-semibold"><i className="bi bi-x-circle me-1" />Out of Stock</span>
            }
          </p>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fw-semibold">Qty:</span>
              <div className="d-flex align-items-center border rounded">
                <button className="btn btn-sm px-3" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="px-3 fw-semibold">{qty}</span>
                <button className="btn btn-sm px-3" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="text-muted small">(max {product.stock})</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn px-4 ${inCart ? 'btn-success' : 'btn-primary-sc'}`}
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
            >
              {adding
                ? <span className="spinner-border spinner-border-sm me-2" />
                : <i className={`bi ${inCart ? 'bi-check2' : 'bi-cart-plus'} me-2`} />
              }
              {inCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
            {inCart && (
              <Link to="/cart" className="btn btn-outline-primary px-4">
                <i className="bi bi-cart2 me-2" />View Cart
              </Link>
            )}
          </div>

          {msg && (
            <div className={`alert py-2 mt-3 small ${msg.includes('Only') ? 'alert-warning' : 'alert-success'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Related Products</h5>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
            {related.map((p) => (
              <div key={p.id} className="col"><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
