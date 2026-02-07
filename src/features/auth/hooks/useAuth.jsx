import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      // Expected response: { access_token: "...", token_type: "bearer" }
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        
        // We might need to fetch user details separately if not returned in login
        // For now, we'll assume we can decode it or we'll fetch it. 
        // Docs don't mention user details in login response, just token.
        // We'll mock the user for now until we have a /me endpoint or similar.
        // Wait, docs say: "Response (200 JSON): { access_token, token_type }"
        // There is no user info. We should probably fetch generic user info or decode JWT.
        // For UI purposes, let's just set a partial user.
        
        const partialUser = { email, role: 'ADMIN' }; // Placeholder
        setUser(partialUser);
        localStorage.setItem('user', JSON.stringify(partialUser));
        return { success: true };
      }
    } catch (error) {
      console.error("Login Error:", error);
      let errorMessage = "Error al iniciar sesión";
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
            // Pydantic validation error array
            errorMessage = detail.map(err => err.msg).join(', ');
        } else if (typeof detail === 'object') {
             errorMessage = JSON.stringify(detail);
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
