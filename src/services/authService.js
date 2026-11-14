import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'

// registerWithEmail: creates the Firebase Auth user only.
// The Firestore users/{uid} document is created automatically
// by AuthContext's onAuthStateChanged → ensureUserDoc.
// Spring Boot equivalent: UserService.register() that only creates
// the auth record; the profile row is created by a login listener.
export const registerWithEmail = async ({ displayName, email, password }) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    console.log('[Auth] Firebase Auth user created. UID:', user.uid)
    await updateProfile(user, { displayName })
    return user
  } catch (err) {
    console.error('[Auth] Registration failed:', err.code, err.message)
    throw err
  }
}

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  } catch (err) {
    console.error('[Auth] Login failed:', err.code, err.message)
    throw err
  }
}

export const loginWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider)
    return user
  } catch (err) {
    console.error('[Auth] Google login failed:', err.code, err.message)
    throw err
  }
}

export const logout = () => signOut(auth)

// updateUserProfile: merges allowed fields into the existing Firestore doc.
// The role field is stripped — it can never be changed from the frontend.
export const updateUserProfile = async (uid, data) => {
  try {
    const { role, uid: _uid, email: _email, createdAt, ...safeData } = data
    await setDoc(doc(db, 'users', uid), safeData, { merge: true })
    console.log('[Firestore] Profile updated for:', uid)
  } catch (err) {
    console.error('[Firestore] Profile update failed:', err.code, err.message)
    throw err
  }
}
