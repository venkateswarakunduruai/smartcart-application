import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

// Ensures a Firestore users/{uid} document always exists for any authenticated user.
// This runs on every login — covers:
//   1. New email/password registrations
//   2. Google sign-ins
//   3. Existing Auth users whose Firestore doc was never created (orphaned users)
// Spring Boot equivalent: a UserDetailsService that creates a DB row on first login
const ensureUserDoc = async (user) => {
  const ref = doc(db, 'users', user.uid)
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      console.log('[AuthContext] Firestore doc exists for:', user.uid)
      return snap.data()
    }

    // Doc missing — create it now (covers orphaned Auth users)
    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      phone: '',
      address: '',
      role: 'customer',
      createdAt: serverTimestamp(),
    }
    console.log('[AuthContext] Creating missing Firestore doc for:', user.uid)
    await setDoc(ref, profile)
    console.log('[AuthContext] Firestore doc created for:', user.uid)
    return profile

  } catch (err) {
    console.error('[AuthContext] ensureUserDoc failed:', err.code, err.message)
    return null
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!currentUser) return
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid))
      setUserProfile(snap.exists() ? snap.data() : null)
    } catch (err) {
      console.error('[AuthContext] refreshProfile failed:', err.code, err.message)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const profile = await ensureUserDoc(user)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const isAdmin = userProfile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
