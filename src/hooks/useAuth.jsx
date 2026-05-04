import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

// ===== CONTEXT =====
const AuthContext = createContext(null);

// ===== PROVIDER =====
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au démarrage si token présent
  useEffect(() => {
    const init = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const me = await authAPI.me();
          setUser(me);
        } catch {
          authAPI.logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Connexion
  const login = async (email, motDePasse) => {
    setError(null);
    try {
      const result = await authAPI.login({ email, motDePasse });
      // L'API retourne { token, user }
      setUser(result.user);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Inscription client
  const register = async (data) => {
    setError(null);
    try {
      const result = await authAPI.registerClient(data);
      setUser(result.user);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Déconnexion
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// ===== HOOK =====
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}