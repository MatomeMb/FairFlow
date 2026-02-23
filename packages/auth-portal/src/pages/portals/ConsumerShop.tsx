import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopShell } from '../../components/layout/ShopShell';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/shared/EmptyState';
import { Toast } from '../../components/shared/Toast';
import { CheckCircle2, Heart, Package, Search, ShoppingCart, Star, X } from 'lucide-react';

interface Product {
  id: string;
  hash?: string;
  name: string;
  merchant: string;
  price: number;
  currency?: string;
  category: string;
  ethicalScore: number;
  inStock: boolean;
  badges: string[];
}

interface PublicCatalogResponse {
  products: Array<{
    hash: string;
    title: string;
    price: number;
    currency: string;
    category?: string;
    merchant_id?: string;
  }>;
}

type Tab = 'browse' | 'wishlist' | 'account';

export const ConsumerShop: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  // Update page title
  React.useEffect(() => {
    document.title = 'fairflow | Shop';
  }, []);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch(`${apiBase}/catalog/public`);
        if (!response.ok) return;
        const data = (await response.json()) as PublicCatalogResponse;
        if (!data.products || data.products.length === 0) return;

        const mapped = data.products.map((item) => ({
          id: item.hash,
          hash: item.hash,
          name: item.title,
          merchant: item.merchant_id || 'fairflow merchant',
          price: item.price / 100,
          currency: item.currency,
          category: item.category || 'General',
          ethicalScore: 5,
          inStock: true,
          badges: ['.thing', 'Portable', 'Stripe Checkout'],
        }));

        setProducts(mapped);
      } catch {
        // Keep demo products fallback
      }
    };

    loadCatalog();
  }, [apiBase]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const getProductIcon = () => (
    <Package className="w-10 h-10 text-emerald-400" />
  );

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.merchant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesScore = p.ethicalScore >= minScore;
      return matchesSearch && matchesCategory && matchesScore;
    });
  }, [products, searchQuery, selectedCategory, minScore]);

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      showToast('Removed from wishlist', 'info');
    } else {
      setWishlist([...wishlist, productId]);
      showToast('Added to wishlist', 'success');
    }
  };

  const handleBuyClick = (product: Product) => {
    if (product.hash) {
      navigate(`/product/${product.hash}`);
      return;
    }
    showToast('This product is not compiled yet. Please try another product.', 'info');
  };

  const renderEthicalScore = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < score ? 'text-emerald-500 fill-current' : 'text-stone-700'}`}
      />
    ));
  };

  const renderBrowse = () => (
    <div className="space-y-8">
      <div className="border-b border-stone-800/60 px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-sm font-semibold text-white">Marketplace</h1>
            <p className="text-xs text-stone-500 mt-0.5">Ethical products, verified sources</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600" />
              <input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-300 placeholder:text-stone-600 focus:outline-none focus:border-stone-600 w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-sm block mb-2">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-stone-400 text-sm block mb-2">Min Ethical Score</label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <option value="0">Any Score</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars Only</option>
              </select>
            </div>
          </div>

          {(searchQuery || selectedCategory || minScore > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setMinScore(0);
              }}
              className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState icon={<Search className="w-10 h-10 text-stone-500" />} title="No products found" description="Try adjusting your filters or search terms" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition group">
              <div className="h-32 bg-gradient-to-br from-emerald-900/30 to-stone-900 flex items-center justify-center group-hover:scale-110 transition">
                {getProductIcon()}
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold group-hover:text-emerald-400 transition">{product.name}</h3>
                    <p className="text-xs text-stone-400 mt-1 font-mono">{product.merchant}</p>
                  </div>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`transition ${wishlist.includes(product.id) ? 'text-red-500' : 'text-stone-600 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {product.badges.map(badge => (
                      <span key={badge} className="bg-emerald-900/50 text-emerald-400 text-xs px-2 py-1 rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Ethical Score</p>
                    <div className="text-emerald-500 text-sm flex gap-0.5">{renderEthicalScore(product.ethicalScore)}</div>
                  </div>
                </div>

                <div className="border-t border-stone-800 pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">R {product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleBuyClick(product)}
                    className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg text-xs font-medium transition focus:ring-2 focus:ring-emerald-500/50 flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" /> Buy
                  </button>
                </div>

                {!product.inStock && (
                  <div className="text-center text-red-500 text-xs font-medium pt-2">Out of Stock</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-8 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Search className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
            <h4 className="font-bold mb-2">Discover</h4>
            <p className="text-sm text-stone-400">Browse our curated selection of ethical products from trusted merchants</p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
            <h4 className="font-bold mb-2">Verify</h4>
            <p className="text-sm text-stone-400">Check ethical scores and certifications for transparency</p>
          </div>
          <div className="text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
            <h4 className="font-bold mb-2">Purchase</h4>
            <p className="text-sm text-stone-400">Buy directly with secure Stripe checkout</p>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 mx-auto mb-3 text-emerald-500 fill-current" />
            <h4 className="font-bold mb-2">Impact</h4>
            <p className="text-sm text-stone-400">Support merchants changing the world, one ethical choice at a time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => {
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));
    
    return (
      <div className="space-y-6">
        {wishlistProducts.length === 0 ? (
          <EmptyState icon={<Heart className="w-10 h-10 text-stone-500" />} title="Your wishlist is empty" description="Add items by clicking the heart icon on products" />
        ) : (
          <div className="space-y-4">
            <p className="text-stone-400">Your wishlist ({wishlistProducts.length} items)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map(product => (
                <div key={product.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition">
                  <div className="h-32 bg-gradient-to-br from-emerald-900/30 to-stone-900 flex items-center justify-center">
                    {getProductIcon()}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{product.name}</h3>
                    <p className="text-xs text-stone-400 mb-3">{product.merchant}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono">R {product.price.toFixed(2)}</span>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-red-500 hover:text-red-600 transition focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAccount = () => (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Account Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-stone-400">Name</span>
            <span>{user?.name || user?.email}</span>
          </div>
          <div className="flex justify-between border-t border-stone-800 pt-3">
            <span className="text-stone-400">Email</span>
            <span className="font-mono text-sm break-all">{user?.email}</span>
          </div>
          <div className="flex justify-between border-t border-stone-800 pt-3">
            <span className="text-stone-400">Role</span>
            <span className="capitalize text-teal-500">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Email me about new products</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Share my ethical score publicly</span>
          </label>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-500 px-6 py-3 rounded-lg font-medium transition"
      >
        Sign Out
      </button>
    </div>
  );

  const tabs = [
    { id: 'browse', label: 'Browse' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'account', label: 'Account' }
  ];

  return (
    <ShopShell tabs={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)}>
      <div >
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'wishlist' && renderWishlist()}
        {activeTab === 'account' && renderAccount()}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </ShopShell>
  );
}
