import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // { id, email, role, permissions: [] }
  const [loading, setLoading] = useState(true);

  // ── Fetch current user profile from /auth/me ─────────────────────────────
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const me = await authService.getMe();
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
      // Token invalid/expired → force logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        // Fetch real user profile + permissions
        const me = await authService.getMe();
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
        return { success: true, user: me };
      }
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') errorMessage = detail;
      else if (Array.isArray(detail)) errorMessage = detail.map(e => e.msg).join(', ');
      return { success: false, error: errorMessage };
    }
  };

  // ── Register Client ───────────────────────────────────────────────────────
  const registerClient = async (clientData) => {
    try {
      await authService.registerClient(clientData);
      // Auto-login after successful registration
      return await login(clientData.usuario.email, clientData.usuario.password);
    } catch (error) {
       let errorMessage = 'Error al registrarse';
       const detail = error.response?.data?.detail;
       if (typeof detail === 'string') errorMessage = detail;
       else if (Array.isArray(detail)) errorMessage = detail.map(e => e.msg).join(', ');
       return { success: false, error: errorMessage };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ── Permission helpers ────────────────────────────────────────────────────
  /** Returns true if user is SUPERADMIN or ADMIN (always full access) */
  const isAdmin = () => user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

  /**
   * Returns true if the user has the given permission code OR is an admin.
   * @param {string} code  e.g. 'productos:leer'
   */
  const hasPermission = (code) => {
    if (!user) return false;
    if (isAdmin()) return true;
    return Array.isArray(user.permissions) && user.permissions.includes(code);
  };

  /**
   * True if user has AT LEAST ONE of the listed permission codes.
   * @param {string[]} codes
   */
  const hasAnyPermission = (codes) => codes.some(c => hasPermission(c));

  return (
    <AuthContext.Provider value={{ user, login, logout, registerClient, isLoading: loading, isAdmin, hasPermission, hasAnyPermission, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
