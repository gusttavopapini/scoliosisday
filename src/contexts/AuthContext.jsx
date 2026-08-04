// src/contexts/AuthContext.jsx
// Provider global de autenticação.
// Escuta onAuthStateChanged, carrega userData do Firestore,
// e expõe login/signup/logout/resetPassword/setDefinitivePassword.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { AuthContext } from './authContextValue.js';
import {
  fetchUserDoc,
  loginUser,
  signupUser,
  resetUserPassword,
  setDefinitivePassword,
  logoutUser,
} from '../services/auth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // ── Escuta mudanças de auth ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await fetchUserDoc(firebaseUser.uid);
          setUser(firebaseUser);
          setUserData(userDoc);
        } catch {
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // ── Login ──
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      setUser(result.user);
      setUserData(result.userData);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cadastro ──
  const signup = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await signupUser(email, password);
      // signupUser faz signOut, então user fica null
      setUser(null);
      setUserData(null);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Recuperação de senha ──
  const resetPassword = useCallback(async (email) => {
    await resetUserPassword(email);
  }, []);

  // ── Definição de senha definitiva ──
  const setPassword = useCallback(async (newPassword) => {
    setLoading(true);
    try {
      await setDefinitivePassword(newPassword);
      // Recarrega o userData para refletir mustChangePassword: false
      if (auth.currentUser) {
        const userDoc = await fetchUserDoc(auth.currentUser.uid);
        setUserData(userDoc);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setUserData(null);
  }, []);

  // ── Recarrega userData do Firestore ──
  const refreshUserData = useCallback(async () => {
    if (!auth.currentUser) return;
    const userDoc = await fetchUserDoc(auth.currentUser.uid);
    setUserData(userDoc);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      initializing,
      login,
      signup,
      logout,
      resetPassword,
      setPassword,
      refreshUserData,
    }),
    [user, userData, loading, initializing, login, signup, logout, resetPassword, setPassword, refreshUserData],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
