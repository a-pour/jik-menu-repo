import React, { useState } from 'react';
import { useAuth } from '../App';
import { api } from '../services/api';
import { toast } from 'sonner';
import { User, Lock, Mail, Save } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.users.update(user.uid, { password });
      toast.success("Password updated successfully");
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Profile Settings</h1>
            <p className="text-neutral-500">Manage your account information</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900">Account Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                Role
              </label>
              <input
                type="text"
                disabled
                value={user.role.replace('_', ' ')}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed uppercase text-xs tracking-widest"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900">Change Password</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Lock size={16} /> New Password
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Lock size={16} /> Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 px-6 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
