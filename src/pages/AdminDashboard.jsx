import { useState, useEffect } from 'react'
import { PRODUCTS, PRODUCT_CATEGORIES, FALLBACK_IMAGE } from '../data/products'
import { getAllOrders, updateOrderStatus } from '../services/orderService'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [productList, setProductList] = useState(PRODUCTS)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Add Product Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Electronics',
    brand: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
  })
  const [addMsg, setAddMsg] = useState('')

  // Load orders when switching to orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders()
    }
  }, [activeTab])

  const loadOrders = async () => {
    setLoadingOrders(true)
    setOrdersError('')
    try {
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error('[AdminDashboard] Orders load error:', err)
      setOrdersError('Failed to fetch store orders from Firestore.')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      )
    } catch (err) {
      alert('Failed to update order status. Please check permissions.')
    }
  }

  // Stock modification
  const handleStockUpdate = (productId, delta) => {
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = Math.max(0, p.stock + delta)
          return { ...p, stock: updatedStock }
        }
        return p
      })
    )
  }

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProductList((prev) => prev.filter((p) => p.id !== productId))
    }
  }

  const handleAddProductSubmit = (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setAddMsg('Please provide product name, price and initial stock.')
      return
    }

    const createdProduct = {
      id: `custom-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      brand: newProduct.brand || 'SmartCart Brand',
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price),
      stock: Number(newProduct.stock),
      image: newProduct.image || FALLBACK_IMAGE,
      rating: 4.5,
      reviews: 1,
      description: newProduct.description || 'Quality product available on SmartCart.',
    }

    setProductList((prev) => [createdProduct, ...prev])
    setNewProduct({
      name: '',
      category: 'Electronics',
      brand: '',
      price: '',
      originalPrice: '',
      stock: '',
      image: '',
      description: '',
    })
    setShowAddModal(false)
    setAddMsg('')
  }

  // Filtered products list
  const filteredProducts = productList.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const q = searchFilter.toLowerCase().trim()
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  // Summary Metrics
  const lowStockCount = productList.filter((p) => p.stock <= 5).length
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0 text-dark d-flex align-items-center">
            <i className="bi bi-speedometer2 me-2 text-warning" />
            SmartCart Admin Dashboard
            <span className="badge bg-danger ms-2 fs-6">Administrator Mode</span>
          </h3>
          <small className="text-muted">Manage product catalogue, stock levels, and customer orders</small>
        </div>

        <button
          className="btn btn-primary-sc d-flex align-items-center gap-2"
          onClick={() => setShowAddModal(!showAddModal)}
        >
          <i className="bi bi-plus-circle-fill" />
          <span>{showAddModal ? 'Close Form' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold">Total Products</small>
                <h3 className="fw-bold mb-0 text-dark">{productList.length}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-primary">
                <i className="bi bi-box-seam fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold">Categories</small>
                <h3 className="fw-bold mb-0 text-dark">{PRODUCT_CATEGORIES.length}</h3>
              </div>
              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-success">
                <i className="bi bi-grid fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold">Low Stock (&le; 5)</small>
                <h3 className="fw-bold mb-0 text-warning">{lowStockCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-warning">
                <i className="bi bi-exclamation-triangle-fill fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold">Total Orders</small>
                <h3 className="fw-bold mb-0 text-danger">{orders.length}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 rounded-3 p-3 text-danger">
                <i className="bi bi-receipt fs-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Collapsible Form */}
      {showAddModal && (
        <div className="card border-0 shadow-sm mb-4 border-start border-warning border-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3 text-dark">Add New Product to Store</h5>
            {addMsg && <div className="alert alert-warning py-2 small">{addMsg}</div>}

            <form onSubmit={handleAddProductSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Category *</label>
                  <select
                    className="form-select"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Brand</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sony, Apple, Nike"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Selling Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 2999"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Original Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 4999"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Units in stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Short product overview and specifications..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary-sc px-4">
                    <i className="bi bi-check2-circle me-1" />
                    Save Product
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active bg-warning text-dark fw-bold' : 'text-dark'}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="bi bi-box-seam me-2" />
            Inventory & Products ({productList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'orders' ? 'active bg-warning text-dark fw-bold' : 'text-dark'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-receipt me-2" />
            Customer Orders ({orders.length})
          </button>
        </li>
      </ul>

      {/* ── TAB 1: Products Management ──────────────────────────────────── */}
      {activeTab === 'products' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {/* Filter toolbar */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name, brand, or category..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 text-md-end text-muted small">
                Showing {filteredProducts.length} items
              </div>
            </div>

            {/* Products Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="rounded border p-1"
                            style={{ width: 44, height: 44, objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = FALLBACK_IMAGE
                            }}
                          />
                          <span className="fw-semibold text-dark small" style={{ maxWidth: 280 }}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{p.category}</span>
                      </td>
                      <td className="small text-muted">{p.brand}</td>
                      <td className="fw-bold text-danger">₹{p.price.toLocaleString()}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                            onClick={() => handleStockUpdate(p.id, -1)}
                            title="Decrease stock"
                          >
                            −
                          </button>
                          <span
                            className={`badge px-2 py-1 ${
                              p.stock <= 5 ? (p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark') : 'bg-success'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                            onClick={() => handleStockUpdate(p.id, 1)}
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete product"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Orders Management ────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">Customer Orders Management</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={loadOrders} disabled={loadingOrders}>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh Orders
              </button>
            </div>

            {loadingOrders && (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" />
                <p className="mt-2 text-muted small">Loading all store orders...</p>
              </div>
            )}

            {ordersError && (
              <div className="alert alert-danger py-2 small">{ordersError}</div>
            )}

            {!loadingOrders && orders.length === 0 && (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-receipt display-4" />
                <p className="mt-3">No customer orders found in the database.</p>
              </div>
            )}

            {!loadingOrders && orders.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light small text-uppercase text-muted">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th className="text-end">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-monospace small fw-bold">{order.orderId || order.id}</td>
                        <td>
                          <div className="fw-semibold small">{order.customerName || 'Customer'}</div>
                          <small className="text-muted">{order.customerEmail}</small>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {(order.items || []).length} items
                          </span>
                        </td>
                        <td className="fw-bold text-danger">₹{Number(order.total).toLocaleString()}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {order.paymentMethod || 'COD'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-success'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {order.orderStatus || 'Placed'}
                          </span>
                        </td>
                        <td className="text-end">
                          <select
                            className="form-select form-select-sm d-inline-block w-auto"
                            value={order.orderStatus || 'Placed'}
                            onChange={(e) => handleStatusChange(order.orderId || order.id, e.target.value)}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
