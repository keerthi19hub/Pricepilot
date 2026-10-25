from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

# ----------------- Auth & Users -----------------
class UserCreate(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# ----------------- Category & Brand -----------------
class CategoryFilterOption(BaseModel):
    key: str
    label: str
    type: str # "select", "range", "boolean"
    options: Optional[List[str]] = None
    min: Optional[float] = None
    max: Optional[float] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    relevant_filters: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class BrandResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    trust_score: float
    warranty_support_score: float

    class Config:
        from_attributes = True

# ----------------- Retailers & Listings -----------------
class RetailerResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    rating: float
    return_policy_days: int
    shipping_info: Optional[str] = None
    is_active: bool
    is_partner: bool
    website_url: Optional[str] = None

    class Config:
        from_attributes = True

class PriceObservationResponse(BaseModel):
    id: int
    price: float
    original_price: Optional[float] = None
    recorded_at: datetime

    class Config:
        from_attributes = True

class RetailerListingResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    retailer: RetailerResponse
    product_url: str
    sku_at_retailer: Optional[str] = None
    title_at_retailer: str
    listed_price: float
    original_price: Optional[float] = None
    discount_percent: float
    in_stock: bool
    shipping_cost: float
    estimated_total_cost: float
    delivery_days: int
    rating: Optional[float] = None
    review_count: int
    warranty_months: int
    return_days: int
    last_verified_at: datetime
    is_verified_live: bool
    source_type: str

    class Config:
        from_attributes = True

# ----------------- Product Variants -----------------
class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    variant_name: str
    sku: Optional[str] = None
    variant_attributes: Dict[str, Any]
    mrp: float

    class Config:
        from_attributes = True

# ----------------- Products -----------------
class ValueScoreBreakdown(BaseModel):
    overall_score: float # 0-100
    quality_score: float # 0-100
    affordability_score: float # 0-100
    reliability_score: float # 0-100
    weights_applied: Dict[str, float]
    explainability_reasons: List[str]

class ProductResponse(BaseModel):
    id: int
    title: str
    brand: BrandResponse
    category: CategoryResponse
    model_number: Optional[str] = None
    gtin_ean: Optional[str] = None
    base_mrp: float
    current_best_price: Optional[float] = None
    description: Optional[str] = None
    primary_image: Optional[str] = None
    specifications: Dict[str, Any] = {}
    unit_quantity: Optional[float] = None
    unit_measure: Optional[str] = None
    normalized_unit_price: Optional[float] = None
    quality_score: float
    reliability_score: float
    best_value_score: Optional[float] = None
    retailer_count: Optional[int] = 0
    lowest_listing_retailer: Optional[str] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    variants: List[ProductVariantResponse] = []
    listings: List[RetailerListingResponse] = []
    value_score_breakdown: Optional[ValueScoreBreakdown] = None
    unit_price_display: Optional[str] = None

class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    size: int
    pages: int
    active_filters: Dict[str, Any]

# ----------------- Price History & Deal Insights -----------------
class PriceHistoryResponse(BaseModel):
    product_id: int
    product_title: str
    current_price: float
    lowest_recorded_price: float
    highest_recorded_price: float
    average_recorded_price: float
    has_sufficient_history: bool
    observation_count: int
    first_recorded_date: Optional[datetime] = None
    last_recorded_date: Optional[datetime] = None
    deal_rating: str # "EXCELLENT_DEAL", "GOOD_PRICE", "AVERAGE_PRICE", "ELEVATED_PRICE", "INSUFFICIENT_DATA"
    deal_explanation: str
    percentage_vs_average: float
    observations: List[Dict[str, Any]]

# ----------------- Recommendations & Budget Finder -----------------
class RecommendationCard(BaseModel):
    badge_type: str # "BEST_OVERALL_VALUE" | "BEST_BUDGET_PICK" | "BEST_QUALITY_WITHIN_BUDGET"
    badge_title: str
    badge_subtitle: str
    product: ProductResponse
    score_breakdown: ValueScoreBreakdown
    why_recommended: List[str]

class BudgetFinderRequest(BaseModel):
    category_id: Optional[int] = None
    category_slug: Optional[str] = None
    budget: float
    priority: Optional[str] = "balanced" # "balanced", "quality_focused", "budget_focused", "reliability_focused"
    brand_preferences: Optional[List[str]] = None
    required_features: Optional[List[str]] = None
    custom_weights: Optional[Dict[str, float]] = None # {"quality": 0.5, "affordability": 0.3, "reliability": 0.2}

class BudgetFinderResponse(BaseModel):
    budget: float
    category_name: Optional[str] = None
    best_overall_value: Optional[RecommendationCard] = None
    best_budget_pick: Optional[RecommendationCard] = None
    best_quality_pick: Optional[RecommendationCard] = None
    all_eligible_products: List[ProductResponse]
    methodology_note: str

# ----------------- Product Comparison Workspace -----------------
class ProductCompareRequest(BaseModel):
    product_ids: List[int] = Field(..., min_length=2, max_length=4)

class AttributeComparison(BaseModel):
    attribute_key: str
    attribute_label: str
    is_different: bool
    values_by_product_id: Dict[str, Any]

class ComparisonWorkspaceResponse(BaseModel):
    products: List[ProductDetailResponse]
    spec_comparisons: List[AttributeComparison]
    price_comparisons: Dict[str, Any]
    value_verdict: str
    verdict_reasons: List[str]
    best_for_scenarios: Dict[str, str] # e.g. {"Best for heavy gaming": "Product A", "Best on tight budget": "Product B"}

# ----------------- Wishlist & Price Alerts -----------------
class WishlistCreate(BaseModel):
    product_id: int
    target_price: Optional[float] = None

class WishlistResponse(BaseModel):
    id: int
    product: ProductResponse
    target_price: Optional[float] = None
    created_at: datetime
    price_drop_amount: Optional[float] = None

    class Config:
        from_attributes = True

class PriceAlertCreate(BaseModel):
    product_id: int
    desired_price: float

class PriceAlertResponse(BaseModel):
    id: int
    product_id: int
    product_title: str
    current_price: float
    desired_price: float
    is_active: bool
    triggered: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Saved Comparisons -----------------
class SavedComparisonCreate(BaseModel):
    title: str
    product_ids: List[int]
    notes: Optional[str] = None

class SavedComparisonResponse(BaseModel):
    id: int
    title: str
    product_ids: List[int]
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- User Preferences -----------------
class UserPreferenceUpdate(BaseModel):
    preferred_categories: Optional[List[str]] = None
    spending_budget: Optional[float] = None
    preferred_brands: Optional[List[str]] = None
    important_features: Optional[List[str]] = None
    quality_weight: Optional[float] = 0.50
    affordability_weight: Optional[float] = 0.30
    reliability_weight: Optional[float] = 0.20

class UserPreferenceResponse(BaseModel):
    preferred_categories: List[str] = []
    spending_budget: Optional[float] = None
    preferred_brands: List[str] = []
    important_features: List[str] = []
    quality_weight: float = 0.50
    affordability_weight: float = 0.30
    reliability_weight: float = 0.20

    class Config:
        from_attributes = True

# ----------------- Admin Operations -----------------
class IngestionAuditResponse(BaseModel):
    id: int
    source_name: str
    filename: Optional[str] = None
    records_processed: int
    records_valid: int
    records_failed: int
    errors: List[Any] = []
    created_at: datetime

    class Config:
        from_attributes = True

class MatchCandidateResponse(BaseModel):
    id: int
    source_title: str
    source_retailer: str
    source_sku: Optional[str] = None
    source_price: float
    candidate_product_id: Optional[int] = None
    confidence_score: float
    status: str
    matched_attributes: Dict[str, Any]
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MatchCandidateUpdate(BaseModel):
    status: str # "CONFIRMED" | "REJECTED"
    rejection_reason: Optional[str] = None
