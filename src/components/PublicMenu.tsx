import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Restaurant, Category, Food } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Search, MapPin, Phone, Instagram, MessageCircle, Send, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n, t } = useTranslation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return;
      try {
        const data = await api.restaurants.getById(slug);
        if (data && data.isEnabled) {
          setRestaurant(data);
          i18n.changeLanguage(data.defaultLanguage);
          
          const [cats, items] = await Promise.all([
            api.categories.getByRestaurant(data.id),
            api.foods.getByRestaurant(data.id)
          ]);
          setCategories(cats.sort((a, b) => a.order - b.order));
          setFoods(items.sort((a, b) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [slug]);

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(next);
  };

  const filteredFoods = foods.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.categoryId === selectedCategory;
    const matchesSearch = 
      food.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.name.fa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full"></div>
          <div className="h-4 w-32 bg-neutral-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Menu Not Found</h1>
        <p className="text-neutral-500 mt-2">This restaurant might be disabled or the link is incorrect.</p>
      </div>
    );
  }

  const isRtl = i18n.language === 'fa';

  return (
    <div className={`min-h-screen bg-white pb-20 ${isRtl ? 'font-sans' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">{restaurant.name}</h1>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Globe size={16} />
            {i18n.language === 'en' ? 'فارسی' : 'English'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Restaurant Hero */}
        <div className="px-4 py-8 text-center space-y-4">
          <h2 className="text-4xl font-black text-neutral-900 tracking-tight">{restaurant.name}</h2>
          {restaurant.description && (
            <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
              {restaurant.description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-500 font-medium">
            {restaurant.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} />
                <span>{restaurant.phone}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 pt-2">
            {restaurant.website && (
              <a href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 rounded-full text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">
                <Globe size={18} />
              </a>
            )}
            {restaurant.socialMedia?.instagram && (
              <a href={`https://instagram.com/${restaurant.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 rounded-full text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
            )}
            {restaurant.socialMedia?.whatsapp && (
              <a href={`https://wa.me/${restaurant.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 rounded-full text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">
                <MessageCircle size={18} />
              </a>
            )}
            {restaurant.socialMedia?.telegram && (
              <a href={`https://t.me/${restaurant.socialMedia.telegram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 rounded-full text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">
                <Send size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-6">
          <div className="relative">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-neutral-400`} size={20} />
            <input
              type="text"
              placeholder={isRtl ? 'جستجو در منو...' : 'Search menu...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full ${isRtl ? 'pr-10' : 'pl-10'} py-3 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all`}
            />
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="px-4 overflow-x-auto no-scrollbar flex gap-3 pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-600'}`}
          >
            {t('all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-600'}`}
            >
              {isRtl ? cat.name.fa : cat.name.en}
            </button>
          ))}
        </div>

        {/* Food List */}
        <div className="px-4 space-y-8 mt-4">
          <AnimatePresence mode="popLayout">
            {categories
              .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
              .map(cat => {
                const catFoods = filteredFoods.filter(f => f.categoryId === cat.id);
                if (catFoods.length === 0) return null;

                return (
                  <motion.section 
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-neutral-100"></div>
                      <h2 className="text-lg font-bold text-neutral-900 px-2">
                        {isRtl ? cat.name.fa : cat.name.en}
                      </h2>
                      <div className="h-px flex-1 bg-neutral-100"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {catFoods.map(food => (
                        <motion.div 
                          key={food.id}
                          layout
                          onClick={() => {
                            setSelectedFood(food);
                            setActiveImageIndex(0);
                          }}
                          className="flex gap-4 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors">
                              {isRtl ? food.name.fa : food.name.en}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                              {isRtl ? food.description.fa : food.description.en}
                            </p>
                            <p className="text-base font-bold text-neutral-900 mt-2">
                              ${food.price}
                            </p>
                          </div>
                          {food.photo && (
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 shadow-sm relative">
                              <img 
                                src={food.photo} 
                                alt={food.name.en}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              {food.gallery && food.gallery.length > 0 && (
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                  +{food.gallery.length}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                );
              })}
          </AnimatePresence>
        </div>
      </main>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFood(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-900 shadow-lg"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto">
                {/* Gallery Slider */}
                <div className="relative aspect-square bg-neutral-100">
                  {(() => {
                    const images = [selectedFood.photo, ...(selectedFood.gallery || [])].filter(Boolean);
                    return (
                      <>
                        <img 
                          src={images[activeImageIndex]} 
                          className="w-full h-full object-cover"
                          alt={selectedFood.name.en}
                        />
                        {images.length > 1 && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg"
                            >
                              <ChevronRight size={20} />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-900">
                        {isRtl ? selectedFood.name.fa : selectedFood.name.en}
                      </h2>
                      <p className="text-sm text-neutral-500 font-medium">
                        {isRtl ? selectedFood.name.en : selectedFood.name.fa}
                      </p>
                    </div>
                    <div className="text-2xl font-black text-neutral-900">
                      ${selectedFood.price}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-px bg-neutral-100" />
                    <p className="text-neutral-600 leading-relaxed">
                      {isRtl ? selectedFood.description.fa : selectedFood.description.en}
                    </p>
                    {isRtl && selectedFood.description.en && (
                      <p className="text-sm text-neutral-400 italic">
                        {selectedFood.description.en}
                      </p>
                    )}
                    {!isRtl && selectedFood.description.fa && (
                      <p className="text-sm text-neutral-400 italic text-right" dir="rtl">
                        {selectedFood.description.fa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="mt-12 border-t border-neutral-100 py-12 px-4 text-center">
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Powered by DineMenu</p>
      </footer>
    </div>
  );
}
