import { Restaurant, Category, Food, User } from '../types';

const API_BASE = '/api';

export const api = {
  auth: {
    login: async (email: string, password?: string): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }
      return res.json();
    },
    signup: async (email: string, role: string, password?: string, restaurantId?: string): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, password, restaurantId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Signup failed');
      }
      return res.json();
    },
  },
  restaurants: {
    getAll: async (): Promise<Restaurant[]> => {
      const res = await fetch(`${API_BASE}/restaurants`);
      return res.json();
    },
    getById: async (id: string): Promise<Restaurant> => {
      const res = await fetch(`${API_BASE}/restaurants/${id}`);
      return res.json();
    },
    create: async (data: Partial<Restaurant>): Promise<Restaurant> => {
      const res = await fetch(`${API_BASE}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
      const res = await fetch(`${API_BASE}/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  categories: {
    getByRestaurant: async (restaurantId: string): Promise<Category[]> => {
      const res = await fetch(`${API_BASE}/categories?restaurantId=${restaurantId}`);
      return res.json();
    },
    create: async (data: Partial<Category>): Promise<Category> => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Category>): Promise<Category> => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    },
  },
  foods: {
    getByRestaurant: async (restaurantId: string, categoryId?: string): Promise<Food[]> => {
      let url = `${API_BASE}/foods?restaurantId=${restaurantId}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      const res = await fetch(url);
      return res.json();
    },
    create: async (data: Partial<Food>): Promise<Food> => {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Food>): Promise<Food> => {
      const res = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`${API_BASE}/foods/${id}`, { method: 'DELETE' });
    },
  },
  users: {
    getAll: async (): Promise<User[]> => {
      const res = await fetch(`${API_BASE}/users`);
      return res.json();
    },
    update: async (uid: string, data: Partial<User>): Promise<User> => {
      const res = await fetch(`${API_BASE}/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user');
      }
      return res.json();
    },
  },
};
