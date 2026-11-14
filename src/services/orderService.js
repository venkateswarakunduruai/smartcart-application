import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Creates a new order document in the 'orders' collection.
 *
 * @param {Object} orderData - Order details including userId, items, shipping, payment, totals
 * @returns {Promise<{success: boolean, orderId: string}>}
 */
export const createOrder = async (orderData) => {
  if (!orderData.userId) {
    throw new Error('User ID is required to place an order')
  }

  try {
    const timestamp = Date.now()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderId = `ORD-${timestamp}-${randomSuffix}`

    const orderRef = doc(db, 'orders', orderId)
    const orderPayload = {
      orderId,
      userId: orderData.userId,
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      phone: orderData.phone || '',
      shippingAddress: orderData.shippingAddress || {},
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      deliveryCharge: Number(orderData.deliveryCharge) || 0,
      discount: Number(orderData.discount) || 0,
      total: Number(orderData.total) || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: orderData.paymentMethod === 'COD' ? 'Pending' : 'Completed',
      orderStatus: 'Placed',
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString(),
    }

    await setDoc(orderRef, orderPayload)
    console.log(`[orderService] Order created successfully: ${orderId}`)
    return { success: true, orderId }
  } catch (err) {
    console.error('[orderService] Error placing order:', err.code, err.message)
    throw err
  }
}

/**
 * Retrieves all orders placed by a specific user.
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Array>} List of user orders sorted from newest to oldest
 */
export const getUserOrders = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch orders')
  }

  try {
    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    const orders = []
    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data(),
      })
    })

    // Sort client-side by date to avoid missing composite index errors
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdDate || 0).getTime()
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdDate || 0).getTime()
      return dateB - dateA
    })

    console.log(`[orderService] Retrieved ${orders.length} orders for UID: ${userId}`)
    return orders
  } catch (err) {
    console.error(`[orderService] Error fetching orders for UID ${userId}:`, err.code, err.message)
    throw err
  }
}

/**
 * Admin: Retrieves all orders across the entire store.
 *
 * @returns {Promise<Array>} List of all customer orders
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders')
    const snapshot = await getDocs(ordersRef)

    const orders = []
    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data(),
      })
    })

    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdDate || 0).getTime()
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdDate || 0).getTime()
      return dateB - dateA
    })

    return orders
  } catch (err) {
    console.error('[orderService] Error fetching all orders:', err.code, err.message)
    throw err
  }
}

/**
 * Admin: Updates the status of an existing order.
 *
 * @param {string} orderId - Unique order ID
 * @param {string} newStatus - New order status ('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
 * @returns {Promise<{success: boolean}>}
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId || !newStatus) {
    throw new Error('Order ID and new status are required')
  }

  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      orderStatus: newStatus,
      updatedAt: serverTimestamp(),
    })
    console.log(`[orderService] Order ${orderId} status updated to: ${newStatus}`)
    return { success: true }
  } catch (err) {
    console.error(`[orderService] Error updating order status for ${orderId}:`, err.code, err.message)
    throw err
  }
}
