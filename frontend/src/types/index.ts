export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  relevant_filters: Array<{
    key: string;
    label: string;
    type: string;
    options?: string[];
  }>;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  trust_score: number;
  warranty_support_score: number;
}

export interface Retailer {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  rating: number;
  return_policy_days: number;
  shipping_info?: string;
  is_active: boolean;
  is_partner: boolean;
  website_url?: string;
}

export interface RetailerListing {
  id: number;
  product_id: number;
  variant_id?: number;
  retailer: Retailer;
  product_url: string;
  sku_at_retailer?: string;
  title_at_retailer: string;
  listed_price: number;
  original_price?: number;
  discount_percent: number;
  in_stock: boolean;
  shipping_cost: number;
  estimated_total_cost: number;
  delivery_days: number;
  rating?: number;
  review_count: number;
  warranty_months: number;
  return_days: number;
  last_verified_at: string;
  is_verified_live: boolean;
  source_type: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku?: string;
  variant_attributes: Record<string, any>;
  mrp: number;
}

export interface ValueScoreBreakdown {
  overall_score: number;
  quality_score: number;
  affordability_score: number;
  reliability_score: number;
  weights_applied: Record<string, number>;
  explainability_reasons: string[];
}

export interface Product {
  id: number;
  title: string;
  brand: Brand;
  category: Category;
  model_number?: string;
  gtin_ean?: string;
  base_mrp: number;
  current_best_price?: number;
  description?: string;
  primary_image?: string;
  specifications: Record<string, any>;
  unit_quantity?: number;
  unit_measure?: string;
  normalized_unit_price?: number;
  quality_score: number;
  reliability_score: number;
  best_value_score?: number;
  retailer_count?: number;
  lowest_listing_retailer?: string;
}

export interface ProductDetail extends Product {
  variants: ProductVariant[];
  listings: RetailerListing[];
  value_score_breakdown?: ValueScoreBreakdown;
  unit_price_display?: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
  active_filters: Record<string, any>;
}

export interface PriceObservation {
  date: string;
  price: number;
  original_price?: number;
  retailer: string;
}

export interface PriceHistory {
  product_id: number;
  product_title: string;
  current_price: number;
  lowest_recorded_price: number;
  highest_recorded_price: number;
  average_recorded_price: number;
  has_sufficient_history: boolean;
  observation_count: number;
  deal_rating: string;
  deal_explanation: string;
  percentage_vs_average: number;
  observations: PriceObservation[];
}

export interface RecommendationCard {
  badge_type: 'BEST_OVERALL_VALUE' | 'BEST_BUDGET_PICK' | 'BEST_QUALITY_WITHIN_BUDGET';
  badge_title: string;
  badge_subtitle: string;
  product: Product;
  score_breakdown: ValueScoreBreakdown;
  why_recommended: string[];
}

export interface BudgetFinderResult {
  budget: number;
  category_name?: string;
  best_overall_value?: RecommendationCard;
  best_budget_pick?: RecommendationCard;
  best_quality_pick?: RecommendationCard;
  all_eligible_products: Product[];
  methodology_note: string;
}

export interface AttributeComparison {
  attribute_key: string;
  attribute_label: string;
  is_different: boolean;
  values_by_product_id: Record<string, any>;
}

export interface ComparisonWorkspace {
  products: ProductDetail[];
  spec_comparisons: AttributeComparison[];
  price_comparisons: {
    lowest_price: number;
    lowest_product_id: number;
    max_price_spread: number;
  };
  value_verdict: string;
  verdict_reasons: string[];
  best_for_scenarios: Record<string, string>;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface WishlistItem {
  id: number;
  product: Product;
  target_price?: number;
  created_at: string;
  price_drop_amount?: number;
}

export interface PriceAlert {
  id: number;
  product_id: number;
  product_title: string;
  current_price: number;
  desired_price: number;
  is_active: boolean;
  triggered: boolean;
}
