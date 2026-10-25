import {
  Category, Brand, Retailer, Product, ProductDetail,
  PaginatedProducts, PriceHistory, BudgetFinderResult,
  ComparisonWorkspace, User, WishlistItem, PriceAlert
} from '../types';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
export const API_BASE = envApiUrl
  ? `${envApiUrl.replace(/\/$/, '')}/api`
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('pricepilot_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(formData: URLSearchParams): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  async register(payload: { email: string; password: string; full_name?: string }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  // Categories & Brands
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getBrands(): Promise<Brand[]> {
    const res = await fetch(`${API_BASE}/brands`);
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  },

  async getRetailers(): Promise<Retailer[]> {
    const res = await fetch(`${API_BASE}/retailers`);
    if (!res.ok) throw new Error('Failed to fetch retailers');
    return res.json();
  },

  // Products
  async getProducts(params: Record<string, any> = {}): Promise<PaginatedProducts> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) {
          v.forEach(item => query.append(k, item.toString()));
        } else {
          query.append(k, v.toString());
        }
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to search products');
    return res.json();
  },

  async getProductDetail(id: number): Promise<ProductDetail> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  async getProductPriceHistory(id: number): Promise<PriceHistory> {
    const res = await fetch(`${API_BASE}/products/${id}/price-history`);
    if (!res.ok) throw new Error('Failed to fetch price history');
    return res.json();
  },

  // Recommendations & Budget Finder
  async runBudgetFinder(payload: {
    category_id?: number;
    category_slug?: string;
    budget: number;
    priority?: string;
    brand_preferences?: string[];
    required_features?: string[];
  }): Promise<BudgetFinderResult> {
    const res = await fetch(`${API_BASE}/recommendations/budget-finder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to get budget recommendations');
    return res.json();
  },

  async getFeaturedRecommendations(): Promise<{ featured: Product[]; methodology: string }> {
    const res = await fetch(`${API_BASE}/recommendations/featured`);
    if (!res.ok) throw new Error('Failed to fetch featured recommendations');
    return res.json();
  },

  // Comparisons
  async compareProducts(productIds: number[]): Promise<ComparisonWorkspace> {
    const res = await fetch(`${API_BASE}/comparisons/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_ids: productIds })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to compare products');
    }
    return res.json();
  },

  // Wishlist & Alerts
  async getWishlist(): Promise<WishlistItem[]> {
    const res = await fetch(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async addToWishlist(productId: number, targetPrice?: number): Promise<WishlistItem> {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, target_price: targetPrice })
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return res.json();
  },

  async removeFromWishlist(wishlistId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/wishlist/${wishlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
  },

  async getPriceAlerts(): Promise<PriceAlert[]> {
    const res = await fetch(`${API_BASE}/wishlist/alerts`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createPriceAlert(productId: number, desiredPrice: number): Promise<PriceAlert> {
    const res = await fetch(`${API_BASE}/wishlist/alerts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, desired_price: desiredPrice })
    });
    if (!res.ok) throw new Error('Failed to create price alert');
    return res.json();
  },

  // Admin
  async getAdminOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return res.json();
  },

  async getAdminMatches(status: string = 'TENTATIVE'): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/matches?status=${status}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch match candidates');
    return res.json();
  },

  async resolveMatch(id: number, status: 'CONFIRMED' | 'REJECTED', reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/matches/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, rejection_reason: reason })
    });
    if (!res.ok) throw new Error('Failed to update match');
    return res.json();
  },

  async toggleRetailerStatus(retailerId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/retailers/${retailerId}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to toggle retailer status');
    return res.json();
  },

  async uploadCsv(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('pricepilot_token');
    const res = await fetch(`${API_BASE}/admin/ingest/csv`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload CSV');
    return res.json();
  },

  // Preferences
  async getPreferences(): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/preferences`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(pref: any): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pref)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  }
};
