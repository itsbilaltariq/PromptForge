import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

/**
 * client/src/context/AuthContext.jsx
 * Tracks whether the user is logged in via Google or is a guest.
 * Exposes: userId, isGuest, user (full object), loading, logout()
 *
 * On mount:
 *  1. Hits GET /auth/me to check if a session cookie exists (logged in)
 *  2. If not logged in, generates or retrieves a guest UUID from localStorage
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [userId,  setUserId]  = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  const generateGuestId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
        if (res.data.loggedIn) {
          setUser(res.data);
          setUserId(res.data.googleId);
          setIsGuest(false);
        } else {
          let guestId = localStorage.getItem('guestId');
          if (!guestId) {
            guestId = generateGuestId();
            localStorage.setItem('guestId', guestId);
          }
          setUserId(guestId);
          setIsGuest(true);
        }
     } catch (e) {
        console.warn('Auth check failed (backend may not be running):', e.message);
        let guestId = localStorage.getItem('guestId');
        if (!guestId) {
          guestId = generateGuestId();
          localStorage.setItem('guestId', guestId);
        }
        setUserId(guestId);
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const logout = async () => {
    await axios.get(`${API}/auth/logout`, { withCredentials: true });
    setUser(null);
    setIsGuest(true);
    const guestId = localStorage.getItem('guestId') || generateGuestId();
    localStorage.setItem('guestId', guestId);
    setUserId(guestId);
  };

  return (
    <AuthContext.Provider value={{ user, userId, isGuest, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}