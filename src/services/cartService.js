import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Retrieve the cart document for the given user ID.
 * Returns an array of cart items, or [] if no cart document exists.
 *
 * @param {string} uid - Firebase Auth user UID
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async (uid) => {
  if (!uid) {
    throw new Error('User UID is required to fetch cart')
  }

  try {
    const cartRef = doc(db, 'carts', uid)
    const snap = await getDoc(cartRef)

    if (snap.exists()) {
      const data = snap.data()
      console.log(`[cartService] Cart loaded for UID: ${uid} (${data.items?.length || 0} items)`)
      return Array.isArray(data.items) ? data.items : []
    }

    console.log(`[cartService] No existing cart document found for UID: ${uid}`)
    return []
  } catch (err) {
    console.error(`[cartService] Error getting cart for ${uid}:`, err.code, err.message)
    throw err
  }
}

/**
 * Save or update the user's cart in Firestore under carts/{uid}.
 * Each document contains: uid, items, updatedAt.
 *
 * @param {string} uid - Firebase Auth user UID
 * @param {Array} items - Array of cart item objects
 * @returns {Promise<{success: boolean}>}
 */
export const saveCart = async (uid, items) => {
  if (!uid) {
    throw new Error('User UID is required to save cart')
  }

  try {
    const cartRef = doc(db, 'carts', uid)
    await setDoc(
      cartRef,
      {
        uid,
        items,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    console.log(`[cartService] Cart saved for UID: ${uid} (${items.length} items)`)
    return { success: true }
  } catch (err) {
    console.error(`[cartService] Error saving cart for ${uid}:`, err.code, err.message)
    throw err
  }
}

/**
 * Clear the user's cart document in Firestore.
 * Sets the items array to [] and updates updatedAt timestamp.
 *
 * @param {string} uid - Firebase Auth user UID
 * @returns {Promise<{success: boolean}>}
 */
export const clearCartDoc = async (uid) => {
  if (!uid) {
    throw new Error('User UID is required to clear cart')
  }

  try {
    const cartRef = doc(db, 'carts', uid)
    await setDoc(
      cartRef,
      {
        uid,
        items: [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    console.log(`[cartService] Cart document cleared for UID: ${uid}`)
    return { success: true }
  } catch (err) {
    console.error(`[cartService] Error clearing cart for ${uid}:`, err.code, err.message)
    throw err
  }
}
