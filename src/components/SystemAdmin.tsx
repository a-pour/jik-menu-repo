import React, { useState, useEffect } from 'react';
import { Restaurant, User } from '../types';
import { Plus, Power, PowerOff, Globe, Mail, Link as LinkIcon, Users, Store as StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';

export default function SystemAdmin() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'users'>('restaurants');
  
  const fetchData = async () => {
    try {
      const [restData, userData] = await Promise.all([
        api.restaurants.getAll(),
        api.users.getAll()
      ]);
      setRestaurants(restData);
      setUsers(userData);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Restaurant Form
  const [isAddingRest, setIsAddingRest] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    password: '',
    defaultLanguage: 'en' as 'en' | 'fa',
    isEnabled: true
  });

  // User Form
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'restaurant_admin' as 'restaurant_admin' | 'system_admin'
  });

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (restaurants.some(r => r.slug === newRestaurant.slug)) {
        toast.error("Slug already exists");
        return;
      }
      // 1. Create User
      const user = await api.auth.signup(newRestaurant.ownerEmail, 'restaurant_admin', newRestaurant.password);
      
      // 2. Create Restaurant
      const createdRest = await api.restaurants.create({
        name: newRestaurant.name,
        slug: newRestaurant.slug,
        ownerUid: user.uid,
        ownerEmail: user.email,
        defaultLanguage: newRestaurant.defaultLanguage,
        isEnabled: true,
        createdAt: new Date().toISOString()
      });

      // 3. Update user with restaurantId
      await api.users.update(user.uid, { restaurantId: createdRest.id });

      setIsAddingRest(false);
      setNewRestaurant({ name: '', slug: '', ownerEmail: '', password: '', defaultLanguage: 'en', isEnabled: true });
      toast.success("Restaurant and Admin created");
      fetchData();
    } catch (error: any) { 
      toast.error(error.message || "Failed to create restaurant"); 
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.signup(newUser.email, newUser.role, newUser.password);
      setIsAddingUser(false);
      setNewUser({ email: '', password: '', role: 'restaurant_admin' });
      toast.success("User created");
      fetchData();
    } catch (error: any) { 
      toast.error(error.message || "Failed to create user"); 
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.restaurants.update(id, { isEnabled: !currentStatus });
      toast.success(`Restaurant ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900">System Administration</h1>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'restaurants' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}
          >
            <StoreIcon size={18} /> Restaurants
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}
          >
            <Users size={18} /> Users
          </button>
        </div>
      </div>

      {activeTab === 'restaurants' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingRest(true)}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus size={20} /> Add Restaurant
            </button>
          </div>

          {isAddingRest && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleCreateRestaurant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Restaurant Name</label>
                  <input
                    required
                    value={newRestaurant.name}
                    onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="e.g. Italian Bistro"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">URL Slug</label>
                  <input
                    required
                    value={newRestaurant.slug}
                    onChange={e => setNewRestaurant({ ...newRestaurant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="e.g. italian-bistro"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Owner Email</label>
                  <input
                    required
                    type="email"
                    value={newRestaurant.ownerEmail}
                    onChange={e => setNewRestaurant({ ...newRestaurant, ownerEmail: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="owner@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Initial Password</label>
                  <input
                    required
                    type="password"
                    value={newRestaurant.password}
                    onChange={e => setNewRestaurant({ ...newRestaurant, password: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Default Language</label>
                  <select
                    value={newRestaurant.defaultLanguage}
                    onChange={e => setNewRestaurant({ ...newRestaurant, defaultLanguage: e.target.value as 'en' | 'fa' })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                  >
                    <option value="en">English</option>
                    <option value="fa">Persian (Farsi)</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingRest(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Create Restaurant
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-neutral-900">{restaurant.name}</h3>
                  <button
                    onClick={() => toggleStatus(restaurant.id, restaurant.isEnabled)}
                    className={`p-2 rounded-lg transition-colors ${restaurant.isEnabled ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    {restaurant.isEnabled ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} />
                    <span className="truncate">/m/{restaurant.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="truncate">{(restaurant as any).ownerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <span>{restaurant.defaultLanguage === 'en' ? 'English' : 'Persian'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${restaurant.isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {restaurant.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus size={20} /> Add User Record
            </button>
          </div>

          {isAddingUser && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Password</label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                  >
                    <option value="restaurant_admin">Restaurant Admin</option>
                    <option value="system_admin">System Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Create User Record
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-xs font-bold text-neutral-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 text-sm text-neutral-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'system_admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
