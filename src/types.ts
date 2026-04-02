export interface I18nString {
  en: string;
  fa: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerUid: string;
  ownerEmail: string;
  defaultLanguage: 'en' | 'fa';
  isEnabled: boolean;
  createdAt?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };
}

export interface Category {
  id: string;
  restaurantId: string;
  name: I18nString;
  description: I18nString;
  image: string;
  order: number;
}

export interface Food {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: I18nString;
  description: I18nString;
  price: number;
  photo: string;
  gallery?: string[];
  order: number;
}

export type UserRole = 'system_admin' | 'restaurant_admin' | 'public';

export interface User {
  uid: string;
  email: string;
  password?: string;
  role: UserRole;
  restaurantId?: string;
}
