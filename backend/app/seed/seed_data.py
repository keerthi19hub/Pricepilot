from datetime import datetime, timedelta, timezone
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import get_password_hash
from backend.app.models.models import (
    User, Category, Brand, Product, ProductVariant,
    Retailer, RetailerListing, PriceObservation, UserPreference
)

def run_seed():
    print("Initializing PricePilot database and seeding multi-category datasets...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data if any (or check if already seeded)
    if db.query(User).filter(User.email == "admin@pricepilot.com").first():
        print("Database already contains seed data. Refreshing seed...")
        db.query(PriceObservation).delete()
        db.query(RetailerListing).delete()
        db.query(ProductVariant).delete()
        db.query(Product).delete()
        db.query(Brand).delete()
        db.query(Category).delete()
        db.query(Retailer).delete()
        db.query(User).delete()
        db.commit()

    # 1. Create Default Users
    admin_user = User(
        email="admin@pricepilot.com",
        hashed_password=get_password_hash("admin123"),
        full_name="PricePilot Administrator",
        is_admin=True,
        is_active=True
    )
    demo_shopper = User(
        email="shopper@pricepilot.com",
        hashed_password=get_password_hash("shopper123"),
        full_name="Priya Sharma",
        is_admin=False,
        is_active=True
    )
    db.add_all([admin_user, demo_shopper])
    db.flush()

    # Create user preferences for demo shopper
    pref = UserPreference(
        user_id=demo_shopper.id,
        preferred_categories=["electronics", "beauty-and-skincare"],
        spending_budget=15000.0,
        preferred_brands=["Samsung", "Sony", "OnePlus", "The Derma Co"],
        important_features=["Battery Life", "Fast Charging", "Warranty"],
        quality_weight=0.50,
        affordability_weight=0.30,
        reliability_weight=0.20
    )
    db.add(pref)

    # 2. Seed Retailers
    retailers_data = [
        {"name": "Amazon India", "slug": "amazon-india", "rating": 4.6, "return_policy_days": 7, "shipping_info": "Free delivery with Prime / orders over ₹499", "is_partner": True, "website_url": "https://www.amazon.in"},
        {"name": "Flipkart", "slug": "flipkart", "rating": 4.5, "return_policy_days": 7, "shipping_info": "Free delivery for Plus members", "is_partner": True, "website_url": "https://www.flipkart.com"},
        {"name": "Croma", "slug": "croma", "rating": 4.4, "return_policy_days": 15, "shipping_info": "Express store delivery available", "is_partner": True, "website_url": "https://www.croma.com"},
        {"name": "Reliance Digital", "slug": "reliance-digital", "rating": 4.3, "return_policy_days": 14, "shipping_info": "Free nationwide store pickup", "is_partner": True, "website_url": "https://www.reliancedigital.in"},
        {"name": "Nykaa", "slug": "nykaa", "rating": 4.7, "return_policy_days": 15, "shipping_info": "100% authentic guarantee, free over ₹299", "is_partner": True, "website_url": "https://www.nykaa.com"},
        {"name": "Myntra", "slug": "myntra", "rating": 4.5, "return_policy_days": 14, "shipping_info": "Hassle-free doorstep returns", "is_partner": True, "website_url": "https://www.myntra.com"},
        {"name": "Tata CLiQ", "slug": "tata-cliq", "rating": 4.3, "return_policy_days": 7, "shipping_info": "Authorised brand warranty", "is_partner": False, "website_url": "https://www.tatacliq.com"}
    ]
    retailer_objs = {}
    for r in retailers_data:
        obj = Retailer(**r)
        db.add(obj)
        retailer_objs[r["slug"]] = obj
    db.flush()

    # 3. Seed 12 Core Categories with relevant filters
    categories_data = [
        {
            "name": "Electronics",
            "slug": "electronics",
            "description": "Smartphones, laptops, headphones, audio devices and smart tech",
            "icon": "Smartphone",
            "relevant_filters": [
                {"key": "storage", "label": "Storage", "type": "select", "options": ["64GB", "128GB", "256GB", "512GB"]},
                {"key": "ram", "label": "RAM", "type": "select", "options": ["4GB", "6GB", "8GB", "16GB"]},
                {"key": "battery", "label": "Battery Life", "type": "select", "options": ["4000mAh+", "5000mAh+", "6000mAh+"]}
            ]
        },
        {
            "name": "Beauty and Skincare",
            "slug": "beauty-and-skincare",
            "description": "Dermatologically tested cleansers, sunscreens, serums, and personal care",
            "icon": "Sparkles",
            "relevant_filters": [
                {"key": "skin_type", "label": "Skin Type", "type": "select", "options": ["All Skin Types", "Oily/Acne-Prone", "Dry", "Sensitive"]},
                {"key": "concern", "label": "Skin Concern", "type": "select", "options": ["Sun Protection", "Acne/Blemishes", "Hydration", "Pigmentation"]},
                {"key": "formulation", "label": "Formulation", "type": "select", "options": ["Gel", "Cream", "Serum", "Lotion"]}
            ]
        },
        {
            "name": "Fashion",
            "slug": "fashion",
            "description": "Footwear, apparel, activewear, bags and lifestyle fashion",
            "icon": "Shirt",
            "relevant_filters": [
                {"key": "gender", "label": "Target Group", "type": "select", "options": ["Men", "Women", "Unisex"]},
                {"key": "size", "label": "Size", "type": "select", "options": ["UK 7", "UK 8", "UK 9", "UK 10", "S", "M", "L", "XL"]},
                {"key": "material", "label": "Material", "type": "select", "options": ["Breathable Mesh", "Cotton", "Leather", "Canvas"]}
            ]
        },
        {
            "name": "Home and Kitchen",
            "slug": "home-and-kitchen",
            "description": "Cookware, food storage, smart kitchen tools and organizers",
            "icon": "Home",
            "relevant_filters": [
                {"key": "material", "label": "Material", "type": "select", "options": ["Tri-ply Stainless Steel", "Cast Iron", "BPA-Free Plastic", "Hard Anodized"]},
                {"key": "induction_compatible", "label": "Induction Friendly", "type": "select", "options": ["Yes", "No"]}
            ]
        },
        {
            "name": "Large and Small Appliances",
            "slug": "appliances",
            "description": "Refrigerators, washing machines, air fryers, and climate control",
            "icon": "Tv",
            "relevant_filters": [
                {"key": "capacity", "label": "Capacity", "type": "select", "options": ["4-5 Litres", "7 Kg", "8 Kg", "1.0 Ton", "1.5 Ton", "260 Litres"]},
                {"key": "energy_rating", "label": "Energy Star Rating", "type": "select", "options": ["3 Star", "4 Star", "5 Star"]},
                {"key": "inverter_tech", "label": "Inverter Technology", "type": "select", "options": ["Yes", "No"]}
            ]
        },
        {
            "name": "Grocery & Household Essentials",
            "slug": "grocery",
            "description": "Packaged nutritious foods, organic beverages and household necessities",
            "icon": "ShoppingBag",
            "relevant_filters": [
                {"key": "diet_type", "label": "Dietary Preference", "type": "select", "options": ["Vegetarian", "Gluten-Free", "High Protein", "Organic"]},
                {"key": "pack_size", "label": "Package Size", "type": "select", "options": ["500g", "1kg", "2kg", "500ml", "1L"]}
            ]
        },
        {
            "name": "Health and Wellness",
            "slug": "health-and-wellness",
            "description": "Blood pressure monitors, weighing scales, wellness accessories",
            "icon": "HeartPulse",
            "relevant_filters": [
                {"key": "device_type", "label": "Device Type", "type": "select", "options": ["Digital BP Monitor", "Smart Scale", "Pulse Oximeter", "Massager"]},
                {"key": "connectivity", "label": "Bluetooth / App Sync", "type": "select", "options": ["Bluetooth Enabled", "Standard Digital"]}
            ]
        },
        {
            "name": "Baby and Kids",
            "slug": "baby-and-kids",
            "description": "Educational STEM toys, BPA-free baby gear, safety essentials",
            "icon": "Baby",
            "relevant_filters": [
                {"key": "age_group", "label": "Age Group", "type": "select", "options": ["0-12 Months", "1-3 Years", "4-8 Years", "8+ Years"]},
                {"key": "safety_cert", "label": "Certification", "type": "select", "options": ["BPA-Free", "BIS Certified", "Non-Toxic"]}
            ]
        },
        {
            "name": "Books and Stationery",
            "slug": "books-and-stationery",
            "description": "Computer science textbooks, productivity journals and fountain pens",
            "icon": "BookOpen",
            "relevant_filters": [
                {"key": "format", "label": "Format", "type": "select", "options": ["Paperback", "Hardcover", "Spiral Bound"]},
                {"key": "language", "label": "Language", "type": "select", "options": ["English", "Hindi"]}
            ]
        },
        {
            "name": "Sports and Fitness",
            "slug": "sports-and-fitness",
            "description": "High-density yoga mats, adjustable dumbbells and training gear",
            "icon": "Dumbbell",
            "relevant_filters": [
                {"key": "activity", "label": "Workout Type", "type": "select", "options": ["Yoga / Pilates", "Strength Training", "Running", "Cross-Training"]},
                {"key": "weight_thickness", "label": "Thickness / Weight", "type": "select", "options": ["6mm", "8mm", "10kg Pair", "20kg Set"]}
            ]
        },
        {
            "name": "Automotive Accessories",
            "slug": "automotive",
            "description": "Digital tire inflators, high-definition dashcams and car vacuum cleaners",
            "icon": "Car",
            "relevant_filters": [
                {"key": "power_source", "label": "Power Source", "type": "select", "options": ["12V Car Socket", "Rechargeable Battery", "USB Type-C"]},
                {"key": "display_type", "label": "Display Type", "type": "select", "options": ["Digital LED", "Analog Dial"]}
            ]
        },
        {
            "name": "Travel and Lifestyle",
            "slug": "travel-and-lifestyle",
            "description": "Polycarbonate luggage trollies, water-resistant laptop bags",
            "icon": "Luggage",
            "relevant_filters": [
                {"key": "luggage_size", "label": "Luggage Size", "type": "select", "options": ["Cabin (55cm)", "Medium Check-in (65cm)", "Large (75cm)"]},
                {"key": "lock_type", "label": "Security Lock", "type": "select", "options": ["TSA Approved Lock", "Standard Combination Lock"]}
            ]
        }
    ]
    category_objs = {}
    for c in categories_data:
        obj = Category(**c)
        db.add(obj)
        category_objs[c["slug"]] = obj
    db.flush()

    # 4. Seed Brands with trust scores
    brands_data = [
        {"name": "Samsung", "slug": "samsung", "trust_score": 92.0, "warranty_support_score": 90.0},
        {"name": "OnePlus", "slug": "oneplus", "trust_score": 88.0, "warranty_support_score": 86.0},
        {"name": "Redmi", "slug": "redmi", "trust_score": 82.0, "warranty_support_score": 80.0},
        {"name": "Sony", "slug": "sony", "trust_score": 95.0, "warranty_support_score": 92.0},
        {"name": "boAt", "slug": "boat", "trust_score": 78.0, "warranty_support_score": 75.0},
        {"name": "The Derma Co", "slug": "the-derma-co", "trust_score": 85.0, "warranty_support_score": 84.0},
        {"name": "Minimalist", "slug": "minimalist", "trust_score": 90.0, "warranty_support_score": 88.0},
        {"name": "Puma", "slug": "puma", "trust_score": 89.0, "warranty_support_score": 85.0},
        {"name": "Prestige", "slug": "prestige", "trust_score": 93.0, "warranty_support_score": 92.0},
        {"name": "Philips", "slug": "philips", "trust_score": 94.0, "warranty_support_score": 91.0},
        {"name": "LG", "slug": "lg", "trust_score": 94.0, "warranty_support_score": 93.0},
        {"name": "Tata Consumer", "slug": "tata-consumer", "trust_score": 96.0, "warranty_support_score": 95.0},
        {"name": "Omron", "slug": "omron", "trust_score": 95.0, "warranty_support_score": 93.0},
        {"name": "Qubo", "slug": "qubo", "trust_score": 84.0, "warranty_support_score": 82.0},
        {"name": "American Tourister", "slug": "american-tourister", "trust_score": 91.0, "warranty_support_score": 90.0},
        {"name": "Boldfit", "slug": "boldfit", "trust_score": 83.0, "warranty_support_score": 80.0},
        {"name": "O'Reilly Media", "slug": "oreilly", "trust_score": 96.0, "warranty_support_score": 95.0}
    ]
    brand_objs = {}
    for b in brands_data:
        obj = Brand(**b)
        db.add(obj)
        brand_objs[b["slug"]] = obj
    db.flush()

    # Helper function to generate realistic past 60-day price history observations
    now = datetime.now(timezone.utc)
    def create_price_history(listing: RetailerListing, current_p: float, mrp: float, trend: str = "stable"):
        obs_list = []
        # Create 5-7 data points over the last 60 days
        days_offsets = [60, 45, 30, 20, 10, 3, 0]
        base = current_p
        
        for idx, days in enumerate(days_offsets):
            date_pt = now - timedelta(days=days)
            if trend == "dropped": # Recently dropped price (Deal)
                price_factor = 1.14 if days > 10 else 1.0
            elif trend == "raised": # Raised price
                price_factor = 0.90 if days > 15 else 1.0
            else: # Standard stable price with minor seasonal dip around day 30
                price_factor = 0.96 if days == 30 else 1.02 if days == 60 else 1.0
                
            recorded_p = round(base * price_factor)
            obs = PriceObservation(
                listing_id=listing.id,
                price=float(recorded_p),
                original_price=float(mrp),
                recorded_at=date_pt
            )
            obs_list.append(obs)
        return obs_list

    # 5. Comprehensive Seed Products Across All 12 Categories
    products_catalog = [
        # --- 1. ELECTRONICS: SMARTPHONES ---
        {
            "title": "Redmi Note 13 5G (Prism Gold, 128GB Storage, 6GB RAM)",
            "brand": "redmi",
            "category": "electronics",
            "model_number": "MZB0FX3IN",
            "gtin_ean": "8901234567890",
            "base_mrp": 20999.0,
            "best_price": 14999.0,
            "description": "Slim 5G smartphone featuring a vibrant 120Hz AMOLED display, 108MP triple camera setup, and 33W fast charging.",
            "primary_image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
            "quality_score": 82.0,
            "reliability_score": 83.0,
            "specifications": {
                "display": "6.67 inch FHD+ AMOLED 120Hz",
                "processor": "MediaTek Dimensity 6080 5G",
                "storage": "128GB",
                "ram": "6GB",
                "battery": "5000mAh with 33W Fast Charging",
                "rear_camera": "108MP + 8MP + 2MP",
                "os": "Android 13, MIUI 14"
            },
            "variants": [
                {"name": "128GB Storage, 6GB RAM", "mrp": 20999.0, "attributes": {"storage": "128GB", "ram": "6GB"}},
                {"name": "256GB Storage, 8GB RAM", "mrp": 22999.0, "attributes": {"storage": "256GB", "ram": "8GB"}}
            ],
            "listings": [
                {"retailer": "amazon-india", "price": 14999.0, "mrp": 20999.0, "rating": 4.2, "reviews": 6840, "shipping": 0.0, "warranty": 12, "trend": "dropped"},
                {"retailer": "flipkart", "price": 15499.0, "mrp": 20999.0, "rating": 4.1, "reviews": 4320, "shipping": 40.0, "warranty": 12, "trend": "stable"},
                {"retailer": "croma", "price": 15999.0, "mrp": 20999.0, "rating": 4.3, "reviews": 610, "shipping": 0.0, "warranty": 12, "trend": "stable"}
            ]
        },
        {
            "title": "Samsung Galaxy M34 5G (Waterfall Blue, 128GB Storage, 6GB RAM)",
            "brand": "samsung",
            "category": "electronics",
            "model_number": "SM-M346BZBD",
            "gtin_ean": "8806095012345",
            "base_mrp": 24499.0,
            "best_price": 15999.0,
            "description": "Massive 6000mAh battery powerhouse with 50MP No Shake OIS camera and Knox Security protection.",
            "primary_image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
            "quality_score": 87.0,
            "reliability_score": 91.0,
            "specifications": {
                "display": "6.5 inch Super AMOLED 120Hz Gorilla Glass 5",
                "processor": "Exynos 1280 Octa-Core",
                "storage": "128GB",
                "ram": "6GB",
                "battery": "6000mAh",
                "rear_camera": "50MP OIS + 8MP + 2MP",
                "os": "Android 14, 4 Years OS Updates"
            },
            "variants": [
                {"name": "128GB Storage, 6GB RAM", "mrp": 24499.0, "attributes": {"storage": "128GB", "ram": "6GB"}},
                {"name": "128GB Storage, 8GB RAM", "mrp": 26499.0, "attributes": {"storage": "128GB", "ram": "8GB"}}
            ],
            "listings": [
                {"retailer": "amazon-india", "price": 15999.0, "mrp": 24499.0, "rating": 4.3, "reviews": 11200, "shipping": 0.0, "warranty": 12, "trend": "stable"},
                {"retailer": "reliance-digital", "price": 16499.0, "mrp": 24499.0, "rating": 4.4, "reviews": 850, "shipping": 0.0, "warranty": 12, "trend": "stable"},
                {"retailer": "croma", "price": 16299.0, "mrp": 24499.0, "rating": 4.3, "reviews": 1200, "shipping": 0.0, "warranty": 12, "trend": "stable"}
            ]
        },
        # --- 1. ELECTRONICS: HEADPHONES ---
        {
            "title": "boAt Rockerz 550 Over-Ear Bluetooth Wireless Headphones",
            "brand": "boat",
            "category": "electronics",
            "model_number": "ROCKERZ550",
            "gtin_ean": "8904123400112",
            "base_mrp": 4999.0,
            "best_price": 1799.0,
            "description": "Over-ear wireless headphones with 50mm dynamic drivers, up to 20 hours playback, and physical noise isolation ear cushions.",
            "primary_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "quality_score": 74.0,
            "reliability_score": 75.0,
            "specifications": {
                "driver_size": "50mm Dynamic Drivers",
                "battery_life": "20 Hours Playback",
                "charging_port": "Type-C Fast Charge",
                "microphone": "Built-in with voice assistant support",
                "connectivity": "Bluetooth 5.0 & 3.5mm AUX"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 1799.0, "mrp": 4999.0, "rating": 4.1, "reviews": 48200, "shipping": 0.0, "warranty": 12, "trend": "stable"},
                {"retailer": "flipkart", "price": 1849.0, "mrp": 4999.0, "rating": 4.0, "reviews": 29400, "shipping": 0.0, "warranty": 12, "trend": "stable"},
                {"retailer": "croma", "price": 1999.0, "mrp": 4999.0, "rating": 4.2, "reviews": 920, "shipping": 0.0, "warranty": 12, "trend": "stable"}
            ]
        },
        {
            "title": "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones with Mic",
            "brand": "sony",
            "category": "electronics",
            "model_number": "WH-CH520",
            "gtin_ean": "4548736143890",
            "base_mrp": 5990.0,
            "best_price": 3990.0,
            "description": "High-fidelity audio with Sony DSEE sound engine, multipoint Bluetooth pairing, and class-leading 50-hour battery life.",
            "primary_image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
            "quality_score": 93.0,
            "reliability_score": 94.0,
            "specifications": {
                "sound_engine": "Sony DSEE Sound Upscaling",
                "battery_life": "50 Hours Long Life",
                "fast_charging": "3 mins charge = 1.5 hours music",
                "multipoint": "Simultaneously connects to Laptop and Phone",
                "weight": "147g Lightweight Ergonomic Design"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 3990.0, "mrp": 5990.0, "rating": 4.5, "reviews": 14300, "shipping": 0.0, "warranty": 12, "trend": "dropped"},
                {"retailer": "croma", "price": 4290.0, "mrp": 5990.0, "rating": 4.6, "reviews": 1180, "shipping": 0.0, "warranty": 12, "trend": "stable"},
                {"retailer": "reliance-digital", "price": 4190.0, "mrp": 5990.0, "rating": 4.5, "reviews": 950, "shipping": 0.0, "warranty": 12, "trend": "stable"}
            ]
        },
        # --- 2. BEAUTY AND SKINCARE ---
        {
            "title": "Minimalist SPF 50 PA++++ Broad Spectrum Sunscreen (50g)",
            "brand": "minimalist",
            "category": "beauty-and-skincare",
            "model_number": "MIN-SUN-50",
            "gtin_ean": "8906142100018",
            "base_mrp": 399.0,
            "best_price": 379.0,
            "unit_quantity": 50.0,
            "unit_measure": "g",
            "normalized_unit_price": 758.0, # ₹758 per 100g
            "description": "Lightweight, non-greasy sunscreen with 4 effective UV filters, Niacinamide, and Vitamin B5. Leaves zero white cast.",
            "primary_image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
            "quality_score": 91.0,
            "reliability_score": 90.0,
            "specifications": {
                "spf_rating": "SPF 50 PA++++",
                "skin_type": "All Skin Types, Oily/Acne-Prone",
                "concern": "Sun Protection, UV Damage, Tan Prevention",
                "formulation": "Lightweight Gel-Cream",
                "fragrance_free": "Yes"
            },
            "listings": [
                {"retailer": "nykaa", "price": 379.0, "mrp": 399.0, "rating": 4.6, "reviews": 28400, "shipping": 0.0, "warranty": 0, "trend": "stable"},
                {"retailer": "amazon-india", "price": 389.0, "mrp": 399.0, "rating": 4.4, "reviews": 19500, "shipping": 0.0, "warranty": 0, "trend": "stable"},
                {"retailer": "flipkart", "price": 399.0, "mrp": 399.0, "rating": 4.4, "reviews": 6800, "shipping": 40.0, "warranty": 0, "trend": "stable"}
            ]
        },
        {
            "title": "The Derma Co 10% Vitamin C Face Serum for Radiance & Glow (30ml)",
            "brand": "the-derma-co",
            "category": "beauty-and-skincare",
            "model_number": "TDC-VITC-30",
            "gtin_ean": "8906112345678",
            "base_mrp": 649.0,
            "best_price": 499.0,
            "unit_quantity": 30.0,
            "unit_measure": "ml",
            "normalized_unit_price": 1663.33, # ₹1,663 per 100ml
            "description": "Formulated with 10% Ethyl Ascorbic Acid, 0.5% Ferulic Acid and Hyaluronic Acid to brighten dull skin and fade hyperpigmentation.",
            "primary_image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
            "quality_score": 86.0,
            "reliability_score": 85.0,
            "specifications": {
                "active_ingredient": "10% Vitamin C + Ferulic Acid",
                "skin_type": "Normal, Dry, Combination",
                "concern": "Pigmentation, Dark Spots, Dullness",
                "formulation": "Aqueous Serum",
                "dermatologically_tested": "Yes"
            },
            "listings": [
                {"retailer": "nykaa", "price": 499.0, "mrp": 649.0, "rating": 4.4, "reviews": 12400, "shipping": 0.0, "warranty": 0, "trend": "dropped"},
                {"retailer": "amazon-india", "price": 549.0, "mrp": 649.0, "rating": 4.3, "reviews": 9800, "shipping": 0.0, "warranty": 0, "trend": "stable"}
            ]
        },
        # --- 3. FASHION: FOOTWEAR ---
        {
            "title": "Puma Men's Flyer Runner Mesh Running Shoes (Black/White)",
            "brand": "puma",
            "category": "fashion",
            "model_number": "19225701",
            "gtin_ean": "4060978912345",
            "base_mrp": 3499.0,
            "best_price": 1899.0,
            "description": "Cushioned everyday running and training shoes with SoftFoam+ sockliner for step-in comfort.",
            "primary_image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            "quality_score": 88.0,
            "reliability_score": 88.0,
            "specifications": {
                "upper_material": "Breathable Mesh",
                "sole_material": "EVA Rubber Outsole",
                "cushioning": "SoftFoam+ Optimal Comfort",
                "closure": "Lace-Up",
                "target_activity": "Road Running, Gym, Daily Walking"
            },
            "variants": [
                {"name": "Size UK 7", "mrp": 3499.0, "attributes": {"size": "UK 7"}},
                {"name": "Size UK 8", "mrp": 3499.0, "attributes": {"size": "UK 8"}},
                {"name": "Size UK 9", "mrp": 3499.0, "attributes": {"size": "UK 9"}},
                {"name": "Size UK 10", "mrp": 3499.0, "attributes": {"size": "UK 10"}}
            ],
            "listings": [
                {"retailer": "myntra", "price": 1899.0, "mrp": 3499.0, "rating": 4.4, "reviews": 31200, "shipping": 0.0, "warranty": 3, "trend": "dropped"},
                {"retailer": "amazon-india", "price": 1999.0, "mrp": 3499.0, "rating": 4.3, "reviews": 18400, "shipping": 0.0, "warranty": 3, "trend": "stable"},
                {"retailer": "flipkart", "price": 2049.0, "mrp": 3499.0, "rating": 4.3, "reviews": 14200, "shipping": 0.0, "warranty": 3, "trend": "stable"}
            ]
        },
        # --- 4. HOME AND KITCHEN ---
        {
            "title": "Prestige Deluxe Alpha Svachh Tri-Ply Stainless Steel Pressure Cooker (3.0 Litre)",
            "brand": "prestige",
            "category": "home-and-kitchen",
            "model_number": "PR-TRI-3L",
            "gtin_ean": "8901365432109",
            "base_mrp": 3650.0,
            "best_price": 2749.0,
            "description": "Heavy-gauge 3-ply stainless steel body with unique Svachh spillage-control lid. Compatible with gas and induction hobs.",
            "primary_image": "https://images.unsplash.com/photo-1584990347449-37651016f443?w=600",
            "quality_score": 92.0,
            "reliability_score": 96.0,
            "specifications": {
                "capacity": "3.0 Litre",
                "material": "Tri-ply (Stainless Steel - Aluminium Core - SS)",
                "lid_type": "Outer Lid with Spillage Control Svachh Channel",
                "induction_compatible": "Yes",
                "warranty": "5 Years Manufacturer Warranty"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 2749.0, "mrp": 3650.0, "rating": 4.5, "reviews": 16400, "shipping": 0.0, "warranty": 60, "trend": "stable"},
                {"retailer": "flipkart", "price": 2799.0, "mrp": 3650.0, "rating": 4.4, "reviews": 8900, "shipping": 0.0, "warranty": 60, "trend": "stable"}
            ]
        },
        # --- 5. LARGE AND SMALL APPLIANCES ---
        {
            "title": "Philips Digital Air Fryer HD9252/90 with Rapid Air Tech (4.1 Litre)",
            "brand": "philips",
            "category": "appliances",
            "model_number": "HD9252/90",
            "gtin_ean": "8710103987654",
            "base_mrp": 12995.0,
            "best_price": 7999.0,
            "description": "Patented starfish rapid air design fries food with up to 90% less fat. 7 preset touch menus for effortless family cooking.",
            "primary_image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600",
            "quality_score": 95.0,
            "reliability_score": 94.0,
            "specifications": {
                "capacity": "4.1 Litres (Serves 3-4 People)",
                "power": "1400 Watts",
                "technology": "Rapid Air Starfish Convection",
                "presets": "7 One-Touch Digital Presets",
                "keep_warm": "Up to 30 minutes"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 7999.0, "mrp": 12995.0, "rating": 4.6, "reviews": 23500, "shipping": 0.0, "warranty": 24, "trend": "dropped"},
                {"retailer": "croma", "price": 8490.0, "mrp": 12995.0, "rating": 4.6, "reviews": 1420, "shipping": 0.0, "warranty": 24, "trend": "stable"},
                {"retailer": "reliance-digital", "price": 8299.0, "mrp": 12995.0, "rating": 4.5, "reviews": 980, "shipping": 0.0, "warranty": 24, "trend": "stable"}
            ]
        },
        {
            "title": "LG 7.0 Kg 5 Star Smart Inverter Fully Automatic Front Load Washing Machine",
            "brand": "lg",
            "category": "appliances",
            "model_number": "FHM1207SDW",
            "gtin_ean": "8806087123987",
            "base_mrp": 38990.0,
            "best_price": 28990.0,
            "description": "Direct Drive 6 Motion washing technology, in-built heater, steam allergy care, and ultra-quiet inverter motor.",
            "primary_image": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600",
            "quality_score": 96.0,
            "reliability_score": 96.0,
            "specifications": {
                "capacity": "7.0 Kg (Ideal for a family of 3-4)",
                "energy_rating": "5 Star BEE Certified",
                "spin_speed": "1200 RPM",
                "motor": "Inverter Direct Drive with 10 Year Warranty",
                "steam_wash": "Allergy Care with 99.9% sanitization"
            },
            "listings": [
                {"retailer": "croma", "price": 28990.0, "mrp": 38990.0, "rating": 4.7, "reviews": 3200, "shipping": 0.0, "warranty": 24, "trend": "stable"},
                {"retailer": "amazon-india", "price": 29490.0, "mrp": 38990.0, "rating": 4.5, "reviews": 8100, "shipping": 0.0, "warranty": 24, "trend": "stable"},
                {"retailer": "reliance-digital", "price": 29290.0, "mrp": 38990.0, "rating": 4.6, "reviews": 1150, "shipping": 0.0, "warranty": 24, "trend": "stable"}
            ]
        },
        # --- 6. GROCERY AND HOUSEHOLD ESSENTIALS ---
        {
            "title": "Tata Sampann 100% Unpolished Organic Turmeric Powder (500g)",
            "brand": "tata-consumer",
            "category": "grocery",
            "model_number": "TAT-TURM-500",
            "gtin_ean": "8901030987654",
            "base_mrp": 195.0,
            "best_price": 149.0,
            "unit_quantity": 500.0,
            "unit_measure": "g",
            "normalized_unit_price": 29.8, # ₹29.80 per 100g
            "description": "Rich in natural essential oils with guaranteed minimum 3% curcumin content. Unpolished with zero artificial colors.",
            "primary_image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600",
            "quality_score": 92.0,
            "reliability_score": 95.0,
            "specifications": {
                "diet_type": "100% Vegetarian & Organic",
                "curcumin_content": "Minimum 3% Guaranteed",
                "packaging": "Pouch Sealed with Aromalock",
                "weight": "500g"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 149.0, "mrp": 195.0, "rating": 4.6, "reviews": 18200, "shipping": 0.0, "warranty": 0, "trend": "stable"},
                {"retailer": "flipkart", "price": 155.0, "mrp": 195.0, "rating": 4.5, "reviews": 7300, "shipping": 0.0, "warranty": 0, "trend": "stable"}
            ]
        },
        # --- 7. HEALTH AND WELLNESS ---
        {
            "title": "Omron HEM 7120 Fully Automatic Digital Blood Pressure Monitor",
            "brand": "omron",
            "category": "health-and-wellness",
            "model_number": "HEM-7120",
            "gtin_ean": "4975479409876",
            "base_mrp": 2540.0,
            "best_price": 1699.0,
            "description": "Clinically validated upper-arm digital BP monitor with Intellisense technology for gentle and precise cuff inflation.",
            "primary_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
            "quality_score": 94.0,
            "reliability_score": 96.0,
            "specifications": {
                "measurement_method": "Oscillometric with Intellisense",
                "accuracy": "Pressure: +-3 mmHg, Pulse: +-5% of reading",
                "cuff_size": "Standard Arm 22-32 cm",
                "indicators": "Hypertension Indicator, Irregular Heartbeat Alert",
                "warranty": "3 Years Manufacturer Warranty"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 1699.0, "mrp": 2540.0, "rating": 4.5, "reviews": 72400, "shipping": 0.0, "warranty": 36, "trend": "dropped"},
                {"retailer": "flipkart", "price": 1749.0, "mrp": 2540.0, "rating": 4.4, "reviews": 31200, "shipping": 0.0, "warranty": 36, "trend": "stable"}
            ]
        },
        # --- 8. AUTOMOTIVE ACCESSORIES ---
        {
            "title": "Qubo Smart Tire Air Inflator for Car & Bike with Auto-Cutoff",
            "brand": "qubo",
            "category": "automotive",
            "model_number": "QTI-CAR-01",
            "gtin_ean": "8908012345678",
            "base_mrp": 4490.0,
            "best_price": 2490.0,
            "description": "Portable battery-powered tire inflator with 150 PSI maximum pressure, digital LED pressure gauge, and emergency flashlight.",
            "primary_image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600",
            "quality_score": 87.0,
            "reliability_score": 88.0,
            "specifications": {
                "max_pressure": "150 PSI",
                "battery": "4000mAh Rechargeable Lithium-ion",
                "auto_cutoff": "Stops automatically at preset PSI",
                "power_input": "Type-C USB & 12V Car Adapter",
                "integrated_light": "Bright LED Emergency Torch"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 2490.0, "mrp": 4490.0, "rating": 4.4, "reviews": 8400, "shipping": 0.0, "warranty": 12, "trend": "dropped"},
                {"retailer": "flipkart", "price": 2590.0, "mrp": 4490.0, "rating": 4.3, "reviews": 3600, "shipping": 0.0, "warranty": 12, "trend": "stable"}
            ]
        },
        # --- 9. TRAVEL AND LIFESTYLE ---
        {
            "title": "American Tourister Ivy 55cm Polycarbonate Hard Luggage Cabin Trolley",
            "brand": "american-tourister",
            "category": "travel-and-lifestyle",
            "model_number": "FO8009001",
            "gtin_ean": "8903214567890",
            "base_mrp": 7500.0,
            "best_price": 2499.0,
            "description": "Ultra-light scratch-resistant polypropylene hard suitcase with 360-degree silent spinner wheels and TSA lock.",
            "primary_image": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600",
            "quality_score": 90.0,
            "reliability_score": 93.0,
            "specifications": {
                "size": "55 cm (Cabin Luggage Compatible with all domestic airlines)",
                "material": "High Impact Polypropylene",
                "wheels": "4 Double Spinner Wheels with 360 rotation",
                "lock": "Side-Mounted TSA Recessed Lock",
                "warranty": "3 Years International Warranty"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 2499.0, "mrp": 7500.0, "rating": 4.3, "reviews": 21800, "shipping": 0.0, "warranty": 36, "trend": "dropped"},
                {"retailer": "myntra", "price": 2699.0, "mrp": 7500.0, "rating": 4.4, "reviews": 9400, "shipping": 0.0, "warranty": 36, "trend": "stable"},
                {"retailer": "flipkart", "price": 2599.0, "mrp": 7500.0, "rating": 4.2, "reviews": 11000, "shipping": 0.0, "warranty": 36, "trend": "stable"}
            ]
        },
        # --- 10. SPORTS AND FITNESS ---
        {
            "title": "Boldfit High Density 10mm NBR Non-Slip Workout & Yoga Mat",
            "brand": "boldfit",
            "category": "sports-and-fitness",
            "model_number": "BF-YM-10MM",
            "gtin_ean": "8907865432109",
            "base_mrp": 1999.0,
            "best_price": 799.0,
            "description": "Extra-thick 10mm anti-tear NBR foam mat that cushions joints, knees, and spine during intense workouts. Includes carry strap.",
            "primary_image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",
            "quality_score": 83.0,
            "reliability_score": 84.0,
            "specifications": {
                "thickness": "10mm Extra Cushioning",
                "material": "Eco-Friendly NBR High Density Foam",
                "grip": "Dual-Sided Non-Slip Texture",
                "dimensions": "183cm x 61cm",
                "accessories": "Free Shoulder Carry Strap Included"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 799.0, "mrp": 1999.0, "rating": 4.3, "reviews": 34100, "shipping": 0.0, "warranty": 6, "trend": "dropped"},
                {"retailer": "flipkart", "price": 849.0, "mrp": 1999.0, "rating": 4.2, "reviews": 15400, "shipping": 0.0, "warranty": 6, "trend": "stable"}
            ]
        },
        # --- 11. BOOKS AND STATIONERY ---
        {
            "title": "Designing Data-Intensive Applications by Martin Kleppmann",
            "brand": "oreilly",
            "category": "books-and-stationery",
            "model_number": "ISBN-9789352135240",
            "gtin_ean": "9789352135240",
            "base_mrp": 2100.0,
            "best_price": 1499.0,
            "description": "The definitive engineering guide to the architecture, reliability, and scalability of modern distributed data systems.",
            "primary_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
            "quality_score": 98.0,
            "reliability_score": 98.0,
            "specifications": {
                "author": "Martin Kleppmann",
                "publisher": "O'Reilly Media / Shroff Publishers",
                "pages": "616 Pages",
                "format": "Paperback",
                "language": "English"
            },
            "listings": [
                {"retailer": "amazon-india", "price": 1499.0, "mrp": 2100.0, "rating": 4.8, "reviews": 9200, "shipping": 0.0, "warranty": 0, "trend": "stable"},
                {"retailer": "flipkart", "price": 1599.0, "mrp": 2100.0, "rating": 4.7, "reviews": 3100, "shipping": 40.0, "warranty": 0, "trend": "stable"}
            ]
        }
    ]

    for pdata in products_catalog:
        prod = Product(
            title=pdata["title"],
            brand_id=brand_objs[pdata["brand"]].id,
            category_id=category_objs[pdata["category"]].id,
            model_number=pdata.get("model_number"),
            gtin_ean=pdata.get("gtin_ean"),
            base_mrp=pdata["base_mrp"],
            current_best_price=pdata["best_price"],
            description=pdata["description"],
            primary_image=pdata["primary_image"],
            specifications=pdata.get("specifications", {}),
            unit_quantity=pdata.get("unit_quantity"),
            unit_measure=pdata.get("unit_measure"),
            normalized_unit_price=pdata.get("normalized_unit_price"),
            quality_score=pdata["quality_score"],
            reliability_score=pdata["reliability_score"]
        )
        db.add(prod)
        db.flush()

        # Add variants if defined
        if "variants" in pdata:
            for vdata in pdata["variants"]:
                pv = ProductVariant(
                    product_id=prod.id,
                    variant_name=vdata["name"],
                    variant_attributes=vdata["attributes"],
                    mrp=vdata["mrp"]
                )
                db.add(pv)
            db.flush()

        # Add Retailer Listings & Historical Price Observations
        for ldata in pdata["listings"]:
            ret_obj = retailer_objs[ldata["retailer"]]
            listing = RetailerListing(
                product_id=prod.id,
                retailer_id=ret_obj.id,
                product_url=f"{ret_obj.website_url}/dp/{pdata.get('model_number', 'PROD')}",
                title_at_retailer=f"{pdata['title']} on {ret_obj.name}",
                listed_price=ldata["price"],
                original_price=ldata["mrp"],
                discount_percent=round(((ldata["mrp"] - ldata["price"]) / ldata["mrp"]) * 100.0, 1),
                in_stock=True,
                shipping_cost=ldata["shipping"],
                estimated_total_cost=ldata["price"] + ldata["shipping"],
                delivery_days=2 if "amazon" in ret_obj.slug else 3,
                rating=ldata["rating"],
                review_count=ldata["reviews"],
                warranty_months=ldata.get("warranty", 12),
                return_days=ret_obj.return_policy_days,
                source_type="DEMO",
                is_verified_live=False
            )
            db.add(listing)
            db.flush()

            # Generate real past 60-day historical observations
            history_pts = create_price_history(listing, ldata["price"], ldata["mrp"], ldata.get("trend", "stable"))
            for pt in history_pts:
                db.add(pt)

    db.commit()
    print("Database successfully seeded with realistic multi-category data, retailer listings, and price observations!")
    db.close()

if __name__ == "__main__":
    run_seed()
