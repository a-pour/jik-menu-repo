import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link
} from 'react-router-dom';
import { Toaster } from 'sonner';
import './i18n';
import { User } from './types';
import { api } from './services/api';
import { LogOut, User as UserIcon, Settings, Store } from 'lucide-react';

// Components
import SystemAdmin from './components/SystemAdmin';
import RestaurantAdmin from './components/RestaurantAdmin';
import PublicMenu from './components/PublicMenu';
import Login from './components/Login';
import Profile from './components/Profile';

// Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  role: null,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dinemenu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    const user = await api.auth.login(email, password);
    setUser(user);
    localStorage.setItem('dinemenu_user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dinemenu_user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, loading, role, login, logout }}>
      <Router>
        {user && (
          <nav className="bg-white border-b border-neutral-100 px-4 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link to="/" className="text-xl font-bold text-neutral-900 tracking-tight">DineMenu</Link>
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  <UserIcon size={18} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                {role === 'system_admin' && (
                  <Link to="/admin/system" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                    <Settings size={18} />
                    <span className="hidden sm:inline">System</span>
                  </Link>
                )}
                {(role === 'restaurant_admin' || role === 'system_admin') && (
                  <Link to="/admin/restaurant" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                    <Store size={18} />
                    <span className="hidden sm:inline">Restaurant</span>
                  </Link>
                )}
                <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        )}
        <Routes>
          {/* Public Menu */}
          <Route path="/m/:slug" element={<PublicMenu />} />
          
          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          
          <Route path="/admin/system/*" element={
            role === 'system_admin' ? <SystemAdmin /> : <Navigate to="/login" />
          } />
          
          <Route path="/admin/restaurant/*" element={
            (role === 'restaurant_admin' || role === 'system_admin') ? <RestaurantAdmin /> : <Navigate to="/login" />
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AuthContext.Provider>
  );
}
