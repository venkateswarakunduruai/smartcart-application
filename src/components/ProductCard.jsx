import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FALLBACK_IMAGE } from '../data/products'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart()
  const { currentUser } = useAuth()
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState('')

  const inCart = items.find((i) => i.id === product.id)
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!currentUser) { setMsg('Login to add to cart'); return }
    setAdding(true)
    const result = await addToCart(product, 1)
    setMsg(result.error || 'Added!')
    setTimeout(() => setMsg(''), 2000)
    setAdding(false)
  }

  return (
    <Link to={`/product/${product.id}`} className="text-decoration-none">
      <div className="product-card d-flex flex-column">
        <div className="position-relative">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = FALLBACK_IMAGE
            }}
          />
          {discount > 0 && (
            <span className="badge bg-success position-absolute top-0 start-0 m-2">
              {discount}% off
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>
          )}
        </div>

        <div className="card-body d-flex flex-column flex-grow-1">
          <p className="small text-muted mb-1">{product.brand}</p>
          <h6 className="fw-semibold mb-1 product-title">{product.name}</h6>
          <StarRating rating={product.rating} reviews={product.reviews} />

          <div className="mt-2 mb-3">
            <span className="price">₹{product.price.toLocaleString()}</span>
            {discount > 0 && (
              <span className="text-muted text-decoration-line-through ms-2 small">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            className={`btn btn-sm mt-auto w-100 ${inCart ? 'btn-success' : 'btn-primary-sc'}`}
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
          >
            {adding
              ? <span className="spinner-border spinner-border-sm" />
              : inCart
                ? <><i className="bi bi-check2 me-1" />In Cart</>
                : <><i className="bi bi-cart-plus me-1" />Add to Cart</>
            }
          </button>
          {msg && <div className="text-center small mt-1" style={{ color: msg === 'Added!' ? 'green' : '#b12704' }}>{msg}</div>}
        </div>
      </div>
    </Link>
  )
}
