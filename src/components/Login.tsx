import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LogIn, LogOut, Shield, Store, Mail, Lock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';

export default function Login() {
  const { user, role, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password is ignored in mock
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email !== 'admin@dinemenu.com') {
        toast.error("Only the default admin can be bootstrapped this way.");
        return;
      }
      if (!password) {
        toast.error("Password is required.");
        return;
      }
      await api.auth.signup(email, 'system_admin', password);
      toast.success("Default Admin created! You can now login.");
      setIsFirstSetup(false);
    } catch (error: any) {
      toast.error(error.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => logout();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">DineMenu</h1>
          <p className="text-neutral-500 mt-2">Multi-Tenant Restaurant Platform</p>
        </div>

        {!user ? (
          <div className="space-y-6">
            <form onSubmit={isFirstSetup ? handleBootstrapAdmin : handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Mail size={16} /> Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none"
                  placeholder="admin@dinemenu.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Lock size={16} /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-neutral-900 text-white py-3 px-4 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isFirstSetup ? <UserPlus size={20} /> : <LogIn size={20} />}
                {loading ? "Processing..." : (isFirstSetup ? "Create Default Admin" : "Sign In")}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setIsFirstSetup(!isFirstSetup)}
                className="text-sm text-neutral-500 hover:text-neutral-900 underline"
              >
                {isFirstSetup ? "Back to Login" : "First time setup? Create Default Admin"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-500">Signed in as</p>
              <p className="font-medium text-neutral-900">{user.email}</p>
              <p className="text-xs text-neutral-400 uppercase mt-1">{role?.replace('_', ' ')}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {role === 'system_admin' && (
                <button
                  onClick={() => navigate('/admin/system')}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Shield size={20} />
                  System Admin
                </button>
              )}
              {(role === 'restaurant_admin' || role === 'system_admin') && (
                <button
                  onClick={() => navigate('/admin/restaurant')}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Store size={20} />
                  Restaurant Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 py-3 px-4 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
