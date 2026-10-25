from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    saved_comparisons = relationship("SavedComparison", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    price_alerts = relationship("PriceAlert", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True) # e.g. "Smartphone", "Sparkles", "Shirt"
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    # JSON array of filter definitions: e.g. [{"key": "ram", "label": "RAM", "type": "select", "options": ["4GB", "6GB", "8GB", "12GB"]}]
    relevant_filters = Column(JSON, default=list)

    # Self-referential relationship
    subcategories = relationship("Category", backref="parent", remote_side=[id])
    products = relationship("Product", back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    trust_score = Column(Float, default=80.0) # 0-100 scale based on service network, build reliability
    warranty_support_score = Column(Float, default=80.0)

    products = relationship("Product", back_populates="brand")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    model_number = Column(String(100), index=True, nullable=True)
    gtin_ean = Column(String(50), index=True, nullable=True) # Barcode / UPC / EAN
    base_mrp = Column(Float, nullable=False)
    current_best_price = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    primary_image = Column(String(500), nullable=True)
    
    # Category-specific structured specifications
    specifications = Column(JSON, default=dict)
    
    # Normalized Unit Price fields
    unit_quantity = Column(Float, nullable=True) # e.g. 100
    unit_measure = Column(String(20), nullable=True) # e.g. "ml", "g", "kg", "units"
    normalized_unit_price = Column(Float, nullable=True) # Calculated unit cost per 100ml / 100g / 1kg / 1 unit
    
    # System computed scores
    quality_score = Column(Float, default=75.0) # 0-100 score
    reliability_score = Column(Float, default=75.0) # 0-100 score
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    listings = relationship("RetailerListing", back_populates="product", cascade="all, delete-orphan")
    wishlist_entries = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")
    price_alerts = relationship("PriceAlert", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_name = Column(String(150), nullable=False) # e.g. "128GB Storage, 6GB RAM, Onyx Black"
    sku = Column(String(100), index=True, nullable=True)
    variant_attributes = Column(JSON, default=dict) # e.g. {"storage": "128GB", "ram": "6GB", "color": "Black"}
    mrp = Column(Float, nullable=False)

    product = relationship("Product", back_populates="variants")
    listings = relationship("RetailerListing", back_populates="variant")


class Retailer(Base):
    __tablename__ = "retailers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False) # Amazon India, Flipkart, Croma, etc.
    slug = Column(String(100), unique=True, index=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    rating = Column(Float, default=4.5)
    return_policy_days = Column(Integer, default=7)
    shipping_info = Column(String(200), default="Free delivery on orders over ₹499")
    is_active = Column(Boolean, default=True)
    is_partner = Column(Boolean, default=False)
    website_url = Column(String(255), nullable=True)

    listings = relationship("RetailerListing", back_populates="retailer")


class RetailerListing(Base):
    __tablename__ = "retailer_listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    retailer_id = Column(Integer, ForeignKey("retailers.id"), nullable=False, index=True)
    
    product_url = Column(String(1000), nullable=False)
    sku_at_retailer = Column(String(100), nullable=True)
    title_at_retailer = Column(String(500), nullable=False)
    
    listed_price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount_percent = Column(Float, default=0.0)
    in_stock = Column(Boolean, default=True)
    shipping_cost = Column(Float, default=0.0)
    estimated_total_cost = Column(Float, nullable=False)
    delivery_days = Column(Integer, default=3)
    
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, default=0)
    warranty_months = Column(Integer, default=12)
    return_days = Column(Integer, default=7)
    
    last_verified_at = Column(DateTime, default=utcnow)
    is_verified_live = Column(Boolean, default=False) # False = labeled demo or cached import
    source_type = Column(String(50), default="DEMO") # DEMO, IMPORT, API, PARTNER

    # Relationships
    product = relationship("Product", back_populates="listings")
    variant = relationship("ProductVariant", back_populates="listings")
    retailer = relationship("Retailer", back_populates="listings")
    price_observations = relationship("PriceObservation", back_populates="listing", cascade="all, delete-orphan")


class PriceObservation(Base):
    __tablename__ = "price_observations"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("retailer_listings.id"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=utcnow, index=True)

    listing = relationship("RetailerListing", back_populates="price_observations")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    target_price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_entries")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    desired_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="price_alerts")
    product = relationship("Product", back_populates="price_alerts")


class SavedComparison(Base):
    __tablename__ = "saved_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    product_ids = Column(JSON, nullable=False) # List of product IDs
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="saved_comparisons")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    preferred_categories = Column(JSON, default=list) # List of category IDs or slugs
    spending_budget = Column(Float, nullable=True)
    preferred_brands = Column(JSON, default=list) # List of brand IDs or names
    important_features = Column(JSON, default=list)
    
    # Recommendation priority weights (sum = 1.0)
    quality_weight = Column(Float, default=0.50)
    affordability_weight = Column(Float, default=0.30)
    reliability_weight = Column(Float, default=0.20)

    user = relationship("User", back_populates="preferences")


class ProductMatchCandidate(Base):
    __tablename__ = "product_match_candidates"

    id = Column(Integer, primary_key=True, index=True)
    source_title = Column(String(500), nullable=False)
    source_retailer = Column(String(100), nullable=False)
    source_sku = Column(String(100), nullable=True)
    source_price = Column(Float, nullable=False)
    
    candidate_product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    confidence_score = Column(Float, nullable=False) # 0 to 100%
    status = Column(String(50), default="TENTATIVE") # CONFIRMED, TENTATIVE, REJECTED
    matched_attributes = Column(JSON, default=dict)
    rejection_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)


class DataIngestionAudit(Base):
    __tablename__ = "data_ingestion_audits"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False)
    filename = Column(String(255), nullable=True)
    records_processed = Column(Integer, default=0)
    records_valid = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    errors = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)
