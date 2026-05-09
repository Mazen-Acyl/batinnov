import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, motDePasse: string) => Promise<User>;
  register: (data: Record<string, string>) => Promise<User>;
  registerPro: (data: Record<string, string | string[]>) => Promise<User>;
  loginWithGoogle: (googleToken: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const login = async (email: string, motDePasse: string): Promise<User> => {
    setError(null);
    try {
      const result = await authAPI.login({ email, motDePasse });
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (data: Record<string, string>): Promise<User> => {
    setError(null);
    try {
      const result = await authAPI.registerClient(data);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const registerPro = async (data: Record<string, string | string[]>): Promise<User> => {
    setError(null);
    try {
      const result = await authAPI.registerPrestataire(data);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (googleToken: string): Promise<User> => {
    setError(null);
    try {
      const result = await authAPI.loginGoogle(googleToken);
      setUser(result.user);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = (): void => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, registerPro, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}
