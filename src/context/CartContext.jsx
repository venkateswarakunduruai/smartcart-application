import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { getCart, saveCart, clearCartDoc } from '../services/cartService'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth()

  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── 1. Load cart from Firestore when user logs in ────────────────────────
  useEffect(() => {
    // If Auth is still initializing, wait
    if (authLoading) return

    let isSubscribed = true

    // If user is logged out, clear cart immediately to isolate users
    if (!currentUser) {
      setCartItems([])
      setLoading(false)
      setError(null)
      return
    }

    const loadUserCart = async () => {
      setLoading(true)
      setError(null)

      try {
        const remoteItems = await getCart(currentUser.uid)

        if (isSubscribed) {
          // Normalize items to guarantee both `qty` and `quantity` properties exist
          const normalized = remoteItems.map((item) => {
            const itemQty = Number(item.qty || item.quantity) || 1
            return {
              ...item,
              qty: itemQty,
              quantity: itemQty,
            }
          })
          setCartItems(normalized)
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('[CartContext] Failed to load cart from Firestore:', err)
          if (err.code === 'permission-denied') {
            setError('Access denied: You can only access your own cart.')
          } else if (err.code === 'unavailable') {
            setError('Network error: Unable to connect to Firestore.')
          } else {
            setError('Failed to load cart items from server.')
          }
          setCartItems([])
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    loadUserCart()

    return () => {
      isSubscribed = false
    }
  }, [currentUser, authLoading])

  // ── 2. Add product to cart ───────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    setError(null)

    if (!currentUser) {
      return { error: 'Please log in to add items to your cart.' }
    }

    if (!product || product.stock <= 0) {
      return { error: 'This product is currently out of stock.' }
    }

    const addQty = Math.max(1, parseInt(quantity, 10) || 1)
    const existing = cartItems.find((i) => i.id === product.id)
    let newItems

    if (existing) {
      const currentQty = existing.qty || existing.quantity || 1
      const newQty = currentQty + addQty

      if (newQty > product.stock) {
        return { error: `Only ${product.stock} items available in stock.` }
      }

      newItems = cartItems.map((i) =>
        i.id === product.id
          ? { ...i, qty: newQty, quantity: newQty }
          : i
      )
    } else {
      if (addQty > product.stock) {
        return { error: `Only ${product.stock} items available in stock.` }
      }

      newItems = [
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.image,
          stock: product.stock,
          brand: product.brand,
          qty: addQty,
          quantity: addQty,
        },
      ]
    }

    // Optimistic UI update
    setCartItems(newItems)

    try {
      await saveCart(currentUser.uid, newItems)
      return { success: true }
    } catch (err) {
      console.error('[CartContext] Save error in addToCart:', err)
      setError('Failed to save cart to server.')
      return { error: 'Failed to sync cart with Firestore. Please try again.' }
    }
  }

  // ── 3. Increase quantity ─────────────────────────────────────────────────
  const increaseQuantity = async (productId) => {
    setError(null)

    const item = cartItems.find((i) => i.id === productId)
    if (!item) return

    const currentQty = item.qty || item.quantity || 1
    if (currentQty >= item.stock) {
      return
    }

    const newQty = currentQty + 1
    const newItems = cartItems.map((i) =>
      i.id === productId
        ? { ...i, qty: newQty, quantity: newQty }
        : i
    )

    setCartItems(newItems)

    if (currentUser) {
      try {
        await saveCart(currentUser.uid, newItems)
      } catch (err) {
        console.error('[CartContext] Save error in increaseQuantity:', err)
        setError('Failed to update item quantity.')
      }
    }
  }

  // ── 4. Decrease quantity ─────────────────────────────────────────────────
  const decreaseQuantity = async (productId) => {
    setError(null)

    const item = cartItems.find((i) => i.id === productId)
    if (!item) return

    const currentQty = item.qty || item.quantity || 1

    if (currentQty <= 1) {
      return removeFromCart(productId)
    }

    const newQty = currentQty - 1
    const newItems = cartItems.map((i) =>
      i.id === productId
        ? { ...i, qty: newQty, quantity: newQty }
        : i
    )

    setCartItems(newItems)

    if (currentUser) {
      try {
        await saveCart(currentUser.uid, newItems)
      } catch (err) {
        console.error('[CartContext] Save error in decreaseQuantity:', err)
        setError('Failed to update item quantity.')
      }
    }
  }

  // ── 5. Update quantity directly (Compatibility helper) ────────────────────
  const updateQty = async (productId, targetQty) => {
    setError(null)

    const numQty = parseInt(targetQty, 10)
    if (isNaN(numQty) || numQty < 1) {
      return removeFromCart(productId)
    }

    const item = cartItems.find((i) => i.id === productId)
    if (!item) return

    if (numQty > item.stock) return

    const newItems = cartItems.map((i) =>
      i.id === productId
        ? { ...i, qty: numQty, quantity: numQty }
        : i
    )

    setCartItems(newItems)

    if (currentUser) {
      try {
        await saveCart(currentUser.uid, newItems)
      } catch (err) {
        console.error('[CartContext] Save error in updateQty:', err)
        setError('Failed to update item quantity.')
      }
    }
  }

  // ── 6. Remove product from cart ──────────────────────────────────────────
  const removeFromCart = async (productId) => {
    setError(null)

    const newItems = cartItems.filter((i) => i.id !== productId)
    setCartItems(newItems)

    if (currentUser) {
      try {
        await saveCart(currentUser.uid, newItems)
      } catch (err) {
        console.error('[CartContext] Save error in removeFromCart:', err)
        setError('Failed to remove item.')
      }
    }
  }

  // ── 7. Clear all items from cart ─────────────────────────────────────────
  const clearCart = async () => {
    setError(null)
    setCartItems([])

    if (currentUser) {
      try {
        await clearCartDoc(currentUser.uid)
      } catch (err) {
        console.error('[CartContext] Save error in clearCart:', err)
        setError('Failed to clear cart document.')
      }
    }
  }

  // ── Calculated totals ────────────────────────────────────────────────────
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.qty || item.quantity) || 1), 0)
  }, [cartItems])

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * (Number(item.qty || item.quantity) || 1),
      0
    )
  }, [cartItems])

  const contextValue = {
    // New standardized properties requested in Phase 3
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    loading,
    error,

    // Aliases to ensure 100% backward compatibility with existing Phase 2/3 pages:
    items: cartItems,
    totalItems: cartCount,
    totalPrice: cartTotal,
    cartLoading: loading,
    updateQty,
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
