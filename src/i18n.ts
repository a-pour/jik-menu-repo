import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: 'Welcome',
          menu: 'Menu',
          categories: 'Categories',
          foods: 'Foods',
          add_category: 'Add Category',
          add_food: 'Add Food',
          restaurant_name: 'Restaurant Name',
          description: 'Description',
          price: 'Price',
          image: 'Image',
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Edit',
          delete: 'Delete',
          system_admin: 'System Admin',
          restaurant_admin: 'Restaurant Admin',
          public_view: 'Public View',
          no_restaurants: 'No restaurants found.',
          create_restaurant: 'Create Restaurant',
          slug: 'URL Slug',
          owner_email: 'Owner Email',
          default_language: 'Default Language',
          status: 'Status',
          enabled: 'Enabled',
          disabled: 'Disabled',
          generate_qr: 'Generate QR Code',
          print: 'Print',
          back: 'Back',
        },
      },
      fa: {
        translation: {
          welcome: 'خوش آمدید',
          menu: 'منو',
          categories: 'دسته‌بندی‌ها',
          foods: 'غذاها',
          add_category: 'افزودن دسته‌بندی',
          add_food: 'افزودن غذا',
          restaurant_name: 'نام رستوران',
          description: 'توضیحات',
          price: 'قیمت',
          image: 'تصویر',
          save: 'ذخیره',
          cancel: 'لغو',
          edit: 'ویرایش',
          delete: 'حذف',
          system_admin: 'مدیر سیستم',
          restaurant_admin: 'مدیر رستوران',
          public_view: 'نمای عمومی',
          no_restaurants: 'رستورانی یافت نشد.',
          create_restaurant: 'ایجاد رستوران',
          slug: 'شناسه URL',
          owner_email: 'ایمیل مالک',
          default_language: 'زبان پیش‌فرض',
          status: 'وضعیت',
          enabled: 'فعال',
          disabled: 'غیرفعال',
          generate_qr: 'ایجاد کد QR',
          print: 'چاپ',
          back: 'بازگشت',
        },
      },
    },
  });

export default i18n;
