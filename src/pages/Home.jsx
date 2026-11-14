import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, searchProducts } from '../data/products'
import ProductCard from '../components/ProductCard'

const CATEGORY_ICONS = {
  'All': 'bi-grid-fill',
  'Electronics': 'bi-laptop',
  'Fashion': 'bi-bag-check-fill',
  'Home & Kitchen': 'bi-house-heart-fill',
  'Books': 'bi-book-half',
  'Beauty & Personal Care': 'bi-stars',
  'Sports & Fitness': 'bi-trophy-fill',
  'Grocery': 'bi-basket2-fill',
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlSearch = searchParams.get('search') || ''
  const urlCategory = searchParams.get('category') || 'All'

  const [category, setCategory] = useState(urlCategory)
  const [query, setQuery] = useState(urlSearch)

  // Keep state synchronized whenever URL search parameters change
  useEffect(() => {
    const q = searchParams.get('search') || ''
    const c = searchParams.get('category') || 'All'
    setQuery(q)
    setCategory(c)
  }, [searchParams])

  // Top-rated products for the Featured section
  const featuredProducts = PRODUCTS.filter((p) => p.rating >= 4.8).slice(0, 5)

  // Active filtered products based on search and category
  const filteredProducts = searchProducts(query, category)

  const handleSearchChange = (newQuery) => {
    setQuery(newQuery)
    const nextParams = {}
    if (newQuery.trim()) nextParams.search = newQuery.trim()
    if (category !== 'All') nextParams.category = category
    setSearchParams(nextParams, { replace: true })
  }

  const handleCategorySelect = (newCategory) => {
    setCategory(newCategory)
    const nextParams = {}
    if (query.trim()) nextParams.search = query.trim()
    if (newCategory !== 'All') nextParams.category = newCategory
    setSearchParams(nextParams, { replace: true })
  }

  const handleResetFilters = () => {
    setQuery('')
    setCategory('All')
    setSearchParams({}, { replace: true })
  }

  const scrollToCatalogue = (e) => {
    e.preventDefault()
    const target = document.getElementById('catalogue-section')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="home-page pb-5">
      {/* ── 1. Hero / Banner Section ───────────────────────────────────── */}
      <section className="hero-banner text-center py-5 px-3">
        <div className="container">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold mb-3">
            <i className="bi bi-lightning-charge-fill me-1" /> Smart Deals Everyday
          </span>
          <h1 className="fw-bolder mb-3">
            <i className="bi bi-cart3 me-2" />
            SmartCart
          </h1>
          <p className="lead mx-auto mb-4 text-light opacity-90" style={{ maxWidth: 680 }}>
            Shop top-rated Electronics, Fashion, Home essentials, Books, Beauty, Sports, and
            Groceries at unbeatable prices with trusted delivery.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <a href="#catalogue-section" className="btn btn-primary-sc btn-lg px-4 py-2" onClick={scrollToCatalogue}>
              <i className="bi bi-bag-fill me-2" /> Shop Now
            </a>
            <button
              className="btn btn-outline-light btn-lg px-4 py-2"
              onClick={() => handleCategorySelect('Electronics')}
            >
              Explore Tech Deals
            </button>
          </div>

          {/* Value proposition badges */}
          <div className="row row-cols-2 row-cols-md-4 g-3 pt-3 border-top border-secondary border-opacity-50 text-light small">
            <div className="col d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-truck fs-5 text-warning" />
              <span>Fast & Free Shipping</span>
            </div>
            <div className="col d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-shield-check fs-5 text-warning" />
              <span>100% Genuine Brands</span>
            </div>
            <div className="col d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-tags-fill fs-5 text-warning" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="col d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-arrow-repeat fs-5 text-warning" />
              <span>7-Day Easy Returns</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4" id="catalogue-section">
        {/* ── 2. Dedicated On-Page Search Bar ────────────────────────────── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Search products by name or brand (e.g. Sony, Apple, Nike, Philips)..."
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search products"
              />
              {query && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => handleSearchChange('')}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Category Filter Pills ─────────────────────────────────── */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold mb-0 text-dark">
              <i className="bi bi-funnel-fill me-1 text-warning" /> Browse Categories
            </h6>
            {(category !== 'All' || query) && (
              <button
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                onClick={handleResetFilters}
              >
                <i className="bi bi-x-circle me-1" />
                Reset filters
              </button>
            )}
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => {
              const iconClass = CATEGORY_ICONS[c] || 'bi-tag-fill'
              const isActive = category === c
              return (
                <button
                  key={c}
                  type="button"
                  className={`category-pill d-inline-flex align-items-center gap-1 ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => handleCategorySelect(c)}
                >
                  <i className={`bi ${iconClass}`} />
                  <span>{c}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 4. Featured Products Section (Shown when no search query) ─── */}
        {!query && category === 'All' && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-stars text-warning me-2" />
                  Featured Products
                </h4>
                <small className="text-muted">Top-rated bestsellers handpicked for you</small>
              </div>
              <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
                Rating 4.8★ & Above
              </span>
            </div>
            <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
              {featuredProducts.map((product) => (
                <div key={`featured-${product.id}`} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Product Results Header ────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
          <div>
            <h5 className="fw-bold mb-0 text-dark">
              {query ? (
                <>
                  Search results for "<span className="text-primary">{query}</span>"
                  {category !== 'All' && (
                    <span className="text-muted fw-normal ms-1">in {category}</span>
                  )}
                </>
              ) : category === 'All' ? (
                'All Products'
              ) : (
                `${category}`
              )}
            </h5>
            <small className="text-muted">Showing {filteredProducts.length} items</small>
          </div>

          {(query || category !== 'All') && (
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* ── 6. Product Grid or Empty State ───────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 border shadow-sm my-4 p-4">
            <div className="mb-3">
              <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }} />
            </div>
            <h5 className="fw-bold text-dark">No products found</h5>
            <p className="text-muted mx-auto" style={{ maxWidth: 450 }}>
              We couldn't find any products matching "<strong>{query}</strong>"
              {category !== 'All' && (
                <>
                  {' '}
                  in the <strong>{category}</strong> category
                </>
              )}
              . Try checking the spelling, using different keywords, or resetting your filters.
            </p>
            <button
              className="btn btn-primary-sc btn-sm px-4 py-2 mt-2"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-1" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
