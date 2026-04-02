import React, { useState, useEffect, useRef } from 'react';
import { Restaurant, Category, Food } from '../types';
import { useAuth } from '../App';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Printer, 
  Upload,
  Store,
  MapPin,
  Phone,
  Globe,
  Instagram,
  MessageCircle,
  Send,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

export default function RestaurantAdmin() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'categories' | 'foods' | 'qr'>('categories');
  const [uploading, setUploading] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      const restaurants = await api.restaurants.getAll();
      const rest = restaurants.find(r => r.ownerEmail === user.email);
      if (rest) {
        setRestaurant(rest);
        const [cats, items] = await Promise.all([
          api.categories.getByRestaurant(rest.id),
          api.foods.getByRestaurant(rest.id)
        ]);
        setCategories(cats.sort((a, b) => a.order - b.order));
        setFoods(items.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      toast.error("Failed to fetch restaurant data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFileUpload = async (file: File): Promise<string> => {
    if (uploading) return '';
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setUploading(true); // Wait, this should be false. Fixing below.
      setUploading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !qrRef.current) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${restaurant?.name}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              font-family: sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .card {
              border: 2px solid #000;
              padding: 40px;
              border-radius: 20px;
              max-width: 400px;
            }
            h1 { margin: 0 0 10px 0; font-size: 32px; }
            p { margin: 5px 0; color: #666; }
            .qr-container { margin: 30px 0; }
            .footer { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${restaurant?.name}</h1>
            ${restaurant?.description ? `<p style="font-style: italic; margin-bottom: 15px;">${restaurant.description}</p>` : ''}
            ${restaurant?.address ? `<p>${restaurant.address}</p>` : ''}
            <div class="qr-container">
              ${qrRef.current.innerHTML}
            </div>
            <p class="footer">Scan to view our digital menu</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 15px; font-size: 14px; color: #444;">
              ${restaurant?.phone ? `<div>📞 ${restaurant.phone}</div>` : ''}
              ${restaurant?.socialMedia?.instagram ? `<div>📸 @${restaurant.socialMedia.instagram}</div>` : ''}
              ${restaurant?.socialMedia?.whatsapp ? `<div>💬 ${restaurant.socialMedia.whatsapp}</div>` : ''}
              ${restaurant?.socialMedia?.telegram ? `<div>✈️ @${restaurant.socialMedia.telegram}</div>` : ''}
            </div>
            ${restaurant?.website ? `<p style="font-size: 12px; margin-top: 10px; color: #999;">${restaurant.website}</p>` : ''}
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Store className="mx-auto text-neutral-300" size={64} />
          <p className="text-neutral-500">No restaurant assigned to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar / Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
            <p className="text-sm text-neutral-500">/m/{restaurant.slug}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              Details
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              Categories
            </button>
            <button 
              onClick={() => setActiveTab('foods')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'foods' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              Foods
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'qr' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              QR Code
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'details' && (
          <RestaurantDetails 
            restaurant={restaurant} 
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'categories' && (
          <CategoryManager 
            restaurantId={restaurant.id} 
            categories={categories} 
            onUpload={handleFileUpload}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'foods' && (
          <FoodManager 
            restaurantId={restaurant.id} 
            categories={categories} 
            foods={foods}
            onUpload={handleFileUpload}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-neutral-100 flex flex-col items-center space-y-6 max-w-sm w-full text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight">{restaurant.name}</h2>
                {restaurant.description && <p className="text-xs text-neutral-400 italic px-4">{restaurant.description}</p>}
                {restaurant.address && <p className="text-sm text-neutral-500">{restaurant.address}</p>}
              </div>

              <div ref={qrRef} className="p-4 bg-white rounded-3xl border-4 border-neutral-900">
                <QRCodeSVG 
                  value={`${window.location.origin}/m/${restaurant.slug}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-4 w-full">
                <p className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Scan to view menu</p>
                <div className="flex flex-col items-center gap-2 text-sm text-neutral-600">
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-neutral-400" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.socialMedia?.instagram && (
                    <div className="flex items-center gap-2">
                      <Instagram size={16} className="text-neutral-400" />
                      <span>@{restaurant.socialMedia.instagram}</span>
                    </div>
                  )}
                  {restaurant.socialMedia?.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-neutral-400" />
                      <span>{restaurant.socialMedia.whatsapp}</span>
                    </div>
                  )}
                  {restaurant.socialMedia?.telegram && (
                    <div className="flex items-center gap-2">
                      <Send size={16} className="text-neutral-400" />
                      <span>@{restaurant.socialMedia.telegram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-2xl hover:bg-neutral-800 transition-all hover:scale-105 shadow-lg font-bold"
              >
                <Printer size={20} />
                Print Menu QR
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components for better organization
function CategoryManager({ restaurantId, categories, onUpload, onRefresh }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    nameEn: '', nameFa: '', descEn: '', descFa: '', image: '', order: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      restaurantId,
      name: { en: form.nameEn, fa: form.nameFa },
      description: { en: form.descEn, fa: form.descFa },
      image: form.image,
      order: Number(form.order)
    };

    try {
      if (editing) {
        await api.categories.update(editing.id, data);
        toast.success("Category updated");
      } else {
        await api.categories.create(data);
        toast.success("Category added");
      }
      reset();
      onRefresh();
    } catch (e) { toast.error("Error saving category"); }
  };

  const reset = () => {
    setIsAdding(false);
    setEditing(null);
    setForm({ nameEn: '', nameFa: '', descEn: '', descFa: '', image: '', order: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Menu Categories</h2>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {(isAdding || editing) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Name (EN)" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="p-2 border rounded" required />
          <input placeholder="Name (FA)" value={form.nameFa} onChange={e => setForm({...form, nameFa: e.target.value})} className="p-2 border rounded" required dir="rtl" />
          <textarea placeholder="Description (EN)" value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} className="p-2 border rounded" />
          <textarea placeholder="Description (FA)" value={form.descFa} onChange={e => setForm({...form, descFa: e.target.value})} className="p-2 border rounded" dir="rtl" />
          <div className="flex items-center gap-4">
            <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="p-2 border rounded w-24" />
            <label className="flex-1 cursor-pointer bg-neutral-50 p-2 border border-dashed rounded flex items-center justify-center gap-2">
              <Upload size={18} />
              <span className="text-sm truncate">{form.image ? 'Change Image' : 'Upload Image'}</span>
              <input type="file" className="hidden" onChange={async e => {
                if (e.target.files?.[0]) {
                  const url = await onUpload(e.target.files[0]);
                  setForm({...form, image: url});
                }
              }} />
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={reset} className="px-4 py-2 text-neutral-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-neutral-900 text-white rounded-lg">Save</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat: Category) => (
          <div key={cat.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
              {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-4 text-neutral-300" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{cat.name.en} / {cat.name.fa}</h3>
              <p className="text-sm text-neutral-500 line-clamp-1">{cat.description.en}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                setEditing(cat);
                setForm({ nameEn: cat.name.en, nameFa: cat.name.fa, descEn: cat.description.en, descFa: cat.description.fa, image: cat.image, order: cat.order });
              }} className="p-2 hover:bg-neutral-100 rounded-lg"><Edit2 size={18} /></button>
              <button onClick={async () => {
                if (window.confirm("Delete category?")) {
                  await api.categories.delete(cat.id);
                  onRefresh();
                }
              }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodManager({ restaurantId, categories, foods, onUpload, onRefresh }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState({
    nameEn: '', nameFa: '', descEn: '', descFa: '', photo: '', price: 0, categoryId: '', order: 0, gallery: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      restaurantId,
      categoryId: form.categoryId,
      name: { en: form.nameEn, fa: form.nameFa },
      description: { en: form.descEn, fa: form.descFa },
      photo: form.photo,
      price: Number(form.price),
      order: Number(form.order),
      gallery: form.gallery
    };

    try {
      if (editing) {
        await api.foods.update(editing.id, data);
        toast.success("Food updated");
      } else {
        await api.foods.create(data);
        toast.success("Food added");
      }
      reset();
      onRefresh();
    } catch (e) { toast.error("Error saving food"); }
  };

  const reset = () => {
    setIsAdding(false);
    setEditing(null);
    setForm({ nameEn: '', nameFa: '', descEn: '', descFa: '', photo: '', price: 0, categoryId: '', order: 0, gallery: [] });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = [];
      for (const file of files) {
        try {
          const url = await onUpload(file);
          if (url) urls.push(url);
        } catch (err) {
          toast.error(`Failed to upload ${(file as any).name}`);
        }
      }
      setForm(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Menu Items</h2>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg">
          <Plus size={18} /> Add Food
        </button>
      </div>

      {(isAdding || editing) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Category</label>
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full p-3 border rounded-xl bg-neutral-50" required>
              <option value="">Select Category</option>
              {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name.en}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">English Name</label>
            <input placeholder="e.g. Grilled Salmon" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full p-3 border rounded-xl" required />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Persian Name</label>
            <input placeholder="نام فارسی" value={form.nameFa} onChange={e => setForm({...form, nameFa: e.target.value})} className="w-full p-3 border rounded-xl text-right" required dir="rtl" />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">English Description</label>
            <textarea placeholder="Ingredients, preparation..." value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} className="w-full p-3 border rounded-xl h-24" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Persian Description</label>
            <textarea placeholder="توضیحات فارسی" value={form.descFa} onChange={e => setForm({...form, descFa: e.target.value})} className="w-full p-3 border rounded-xl h-24 text-right" dir="rtl" />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Price ($)</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full p-3 border rounded-xl" required />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Display Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full p-3 border rounded-xl" />
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Main Photo</label>
            <div className="flex items-center gap-4">
              {form.photo && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200">
                  <img src={form.photo} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm({...form, photo: ''})} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 shadow-sm">
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex-1 cursor-pointer bg-neutral-50 p-6 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-neutral-100 transition-colors">
                <Upload className="text-neutral-400" size={24} />
                <span className="text-sm font-medium text-neutral-600">Click to upload main photo</span>
                <input type="file" className="hidden" onChange={async e => {
                  if (e.target.files?.[0]) {
                    const url = await onUpload(e.target.files[0]);
                    setForm({...form, photo: url});
                  }
                }} />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Gallery Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {form.gallery.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square cursor-pointer bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-100 transition-colors">
                <Plus className="text-neutral-400" size={20} />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Add More</span>
                <input type="file" multiple className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={reset} className="px-6 py-3 text-neutral-500 font-medium hover:bg-neutral-50 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg">
              {editing ? 'Update Item' : 'Add to Menu'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foods.map((food: Food) => (
          <div key={food.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 relative">
              {food.photo ? <img src={food.photo} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-6 text-neutral-300" />}
              {food.gallery && food.gallery.length > 0 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                  +{food.gallery.length}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-neutral-900 truncate">{food.name.en}</h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{food.name.fa}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-black text-neutral-900">${food.price}</span>
                <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full font-bold uppercase tracking-wider">
                  {(categories.find((c: any) => c.id === food.categoryId) as any)?.name?.en}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => {
                setEditing(food);
                setForm({ 
                  nameEn: food.name.en, nameFa: food.name.fa, descEn: food.description.en, descFa: food.description.fa, 
                  photo: food.photo, price: food.price, categoryId: food.categoryId, order: food.order,
                  gallery: food.gallery || []
                });
              }} className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors"><Edit2 size={18} /></button>
              <button onClick={async () => {
                if (window.confirm("Delete food?")) {
                  await api.foods.delete(food.id);
                  onRefresh();
                }
              }} className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RestaurantDetails({ restaurant, onRefresh }: { restaurant: Restaurant, onRefresh: () => void }) {
  const [form, setForm] = useState({
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description || '',
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    website: restaurant.website || '',
    socialMedia: {
      instagram: restaurant.socialMedia?.instagram || '',
      whatsapp: restaurant.socialMedia?.whatsapp || '',
      telegram: restaurant.socialMedia?.telegram || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.restaurants.update(restaurant.id, {
        ...restaurant,
        ...form
      });
      toast.success("Restaurant details updated");
      onRefresh();
    } catch (error) {
      toast.error("Failed to update details");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="text-2xl font-black text-neutral-900">Restaurant Details</h2>
          <p className="text-neutral-500 text-sm mt-1">Update your public profile and contact information.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Restaurant Name</label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Slug (URL)</label>
              <input 
                value={form.slug} 
                disabled
                className="w-full p-4 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Restaurant Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all h-24"
              placeholder="Tell us about your restaurant..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-neutral-400" size={20} />
              <textarea 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})}
                className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all h-24"
                placeholder="123 Foodie St, Gourmet City"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-neutral-400" size={20} />
                <input 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Website</label>
              <div className="relative">
                <Globe className="absolute left-4 top-4 text-neutral-400" size={20} />
                <input 
                  value={form.website} 
                  onChange={e => setForm({...form, website: e.target.value})}
                  className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="www.yourrestaurant.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-[0.2em]">Social Media</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Instagram className="absolute left-4 top-4 text-neutral-400" size={20} />
                <input 
                  value={form.socialMedia.instagram} 
                  onChange={e => setForm({...form, socialMedia: {...form.socialMedia, instagram: e.target.value}})}
                  className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="Instagram Username"
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-4 text-neutral-400" size={20} />
                <input 
                  value={form.socialMedia.whatsapp} 
                  onChange={e => setForm({...form, socialMedia: {...form.socialMedia, whatsapp: e.target.value}})}
                  className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="WhatsApp Number"
                />
              </div>
              <div className="relative">
                <Send className="absolute left-4 top-4 text-neutral-400" size={20} />
                <input 
                  value={form.socialMedia.telegram} 
                  onChange={e => setForm({...form, socialMedia: {...form.socialMedia, telegram: e.target.value}})}
                  className="w-full p-4 pl-12 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="Telegram Username"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
