import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc
from backend.app.core.database import get_db
from backend.app.models.models import Product, ProductVariant, RetailerListing, Brand, Category, PriceObservation, Retailer
from backend.app.schemas.schemas import (
    ProductResponse, ProductDetailResponse, PaginatedProductsResponse,
    PriceHistoryResponse, ValueScoreBreakdown, RetailerListingResponse
)
from backend.app.services.scoring_engine import ScoringEngine
from backend.app.services.price_history_service import PriceHistoryService
from backend.app.services.unit_price_service import UnitPriceService

router = APIRouter(prefix="/products", tags=["Products & Universal Search"])

def parse_natural_language_query(query_str: str) -> Dict[str, Any]:
    """
    Parses conversational and natural language shopping queries.
    e.g., 'Best smartphone under 15000', 'Good skincare under ₹500', 'Affordable running shoes under 2000'
    """
    clean = query_str.lower().strip()
    extracted = {
        "text_search": query_str,
        "max_price": None,
        "category_hint": None,
        "priority_hint": "balanced"
    }

    # Extract price constraint: e.g. "under 15,000", "below ₹500", "< 2000"
    price_pattern = re.search(r'(?:under|below|less than|within|budget of|<)\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)', clean)
    if price_pattern:
        price_num_str = price_pattern.group(1).replace(",", "")
        try:
            extracted["max_price"] = float(price_num_str)
            # Remove the price part from clean text
            clean = re.sub(r'(?:under|below|less than|within|budget of|<)\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)', '', clean).strip()
        except ValueError:
            pass

    # Extract priority hints
    if any(w in clean for w in ["best value", "value for money", "vfm"]):
        extracted["priority_hint"] = "balanced"
    elif any(w in clean for w in ["cheap", "budget", "affordable", "lowest price"]):
        extracted["priority_hint"] = "budget_focused"
    elif any(w in clean for w in ["best quality", "top rated", "flagship", "premium", "highest rated"]):
        extracted["priority_hint"] = "quality_focused"

    # Category hints
    category_keywords = {
        "smartphone": ["smartphone", "mobile", "phone", "iphone", "android"],
        "headphones": ["headphones", "earphones", "earbuds", "tws", "headset"],
        "beauty-and-skincare": ["skincare", "serum", "sunscreen", "cleanser", "moisturizer", "cream", "facewash"],
        "appliances": ["washing machine", "refrigerator", "fridge", "air conditioner", "ac", "air fryer", "microwave", "mixer"],
        "sports-and-fitness": ["running shoes", "shoes", "sneakers", "yoga mat", "dumbbells"],
        "electronics": ["laptop", "tablet", "tv", "smartwatch", "camera"],
        "home-and-kitchen": ["cookware", "pan", "bottle", "container", "furniture"],
        "grocery": ["oats", "tea", "coffee", "oil", "soap", "detergent"],
        "baby-and-kids": ["baby", "toy", "stroller", "diaper"],
        "automotive": ["dash cam", "car", "inflator", "tyre"],
        "travel-and-lifestyle": ["luggage", "trolley", "backpack", "suitcase"]
    }

    for cat_slug, kw_list in category_keywords.items():
        if any(kw in clean for kw in kw_list):
            extracted["category_hint"] = cat_slug
            break

    # Clean residual filler words from search query
    filler_words = ["best", "good", "find", "me", "a", "an", "the", "for", "online", "classes", "small", "family"]
    tokens = clean.split()
    remaining_tokens = [t for t in tokens if t not in filler_words and len(t) > 1]
    extracted["text_search"] = " ".join(remaining_tokens) if remaining_tokens else query_str

    return extracted


def build_product_response(product: Product, budget: Optional[float] = None) -> ProductResponse:
    # Compute retailer listings summary
    retailer_names = [listing.retailer.name for listing in product.listings if listing.retailer]
    lowest_retailer = None
    if product.listings:
        sorted_listings = sorted(product.listings, key=lambda x: x.estimated_total_cost)
        if sorted_listings and sorted_listings[0].retailer:
            lowest_retailer = sorted_listings[0].retailer.name

    # Compute value score
    eval_res = ScoringEngine.evaluate_product(
        price=product.current_best_price or product.base_mrp,
        base_quality=product.quality_score,
        rating=product.listings[0].rating if product.listings else 4.2,
        review_count=product.listings[0].review_count if product.listings else 250,
        brand_trust_score=product.brand.trust_score if product.brand else 80.0,
        budget=budget
    )

    resp = ProductResponse.model_validate(product)
    resp.retailer_count = len(product.listings)
    resp.lowest_listing_retailer = lowest_retailer
    resp.best_value_score = eval_res["overall_score"]
    return resp


@router.get("", response_model=PaginatedProductsResponse)
def get_products(
    q: Optional[str] = Query(None, description="Search query or natural language prompt"),
    category_id: Optional[int] = Query(None),
    category_slug: Optional[str] = Query(None),
    brand_ids: Optional[List[int]] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    min_quality_score: Optional[float] = Query(None),
    in_stock_only: bool = Query(False),
    retailer_id: Optional[int] = Query(None),
    sort_by: str = Query("best_value", description="best_value, price_asc, price_desc, rating_desc, quality_desc"),
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    # Dynamic category-specific spec filter values passed as JSON or specific query params
    spec_storage: Optional[str] = Query(None),
    spec_ram: Optional[str] = Query(None),
    spec_skin_concern: Optional[str] = Query(None),
    spec_capacity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.listings).joinedload(RetailerListing.retailer)
    )

    active_filters = {}

    # Normalize defaults when invoked directly outside FastAPI request lifecycle
    str_q = q if isinstance(q, str) and q.strip() else None
    cat_id = category_id if isinstance(category_id, int) else None
    cat_slug = category_slug if isinstance(category_slug, str) else None
    b_ids = brand_ids if isinstance(brand_ids, list) else None
    p_min = min_price if isinstance(min_price, (int, float)) else None
    p_max = max_price if isinstance(max_price, (int, float)) else None
    q_score_min = min_quality_score if isinstance(min_quality_score, (int, float)) else None
    ret_id = retailer_id if isinstance(retailer_id, int) else None
    s_by = sort_by if isinstance(sort_by, str) else "best_value"
    p_num = page if isinstance(page, int) else 1
    s_num = size if isinstance(size, int) else 12

    # Handle Natural Language Query if provided
    parsed_nl = None
    if str_q:
        parsed_nl = parse_natural_language_query(str_q)
        if parsed_nl["max_price"] and p_max is None:
            p_max = parsed_nl["max_price"]
            active_filters["nl_budget_detected"] = p_max

        # Search matching
        search_terms = parsed_nl["text_search"].split()
        if search_terms:
            text_filters = []
            for term in search_terms:
                term_like = f"%{term}%"
                text_filters.append(Product.title.ilike(term_like))
                text_filters.append(Product.description.ilike(term_like))
                text_filters.append(Product.model_number.ilike(term_like))
            query = query.filter(or_(*text_filters))
            active_filters["q"] = str_q

    # Category filter
    if cat_id:
        query = query.filter(Product.category_id == cat_id)
        active_filters["category_id"] = cat_id
    elif cat_slug:
        cat = db.query(Category).filter(Category.slug == cat_slug.lower()).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
            active_filters["category_slug"] = cat_slug
    elif parsed_nl and parsed_nl["category_hint"]:
        cat = db.query(Category).filter(Category.slug.ilike(f"%{parsed_nl['category_hint']}%")).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
            active_filters["inferred_category"] = cat.name

    # Brand filter
    if b_ids:
        query = query.filter(Product.brand_id.in_(b_ids))
        active_filters["brand_ids"] = b_ids

    # Price range filter
    if p_min is not None:
        query = query.filter(Product.current_best_price >= p_min)
        active_filters["min_price"] = p_min
    if p_max is not None:
        query = query.filter(Product.current_best_price <= p_max)
        active_filters["max_price"] = p_max

    # Quality score filter
    if q_score_min is not None:
        query = query.filter(Product.quality_score >= q_score_min)
        active_filters["min_quality_score"] = q_score_min

    # Retailer filter
    if ret_id:
        query = query.join(Product.listings).filter(RetailerListing.retailer_id == ret_id)
        active_filters["retailer_id"] = ret_id

    # Category-specific spec filters
    f_storage = spec_storage if isinstance(spec_storage, str) else None
    f_ram = spec_ram if isinstance(spec_ram, str) else None
    f_skin = spec_skin_concern if isinstance(spec_skin_concern, str) else None
    f_capacity = spec_capacity if isinstance(spec_capacity, str) else None

    if f_storage:
        active_filters["spec_storage"] = f_storage
    if f_ram:
        active_filters["spec_ram"] = f_ram
    if f_skin:
        active_filters["spec_skin_concern"] = f_skin
    if f_capacity:
        active_filters["spec_capacity"] = f_capacity

    all_matches = query.all()

    # In-memory post-filtering for JSON specifications
    filtered_products = []
    for p in all_matches:
        specs = p.specifications or {}
        if f_storage and specs.get("storage") != f_storage:
            continue
        if f_ram and specs.get("ram") != f_ram:
            continue
        if f_skin and f_skin.lower() not in str(specs.get("concern", "")).lower():
            continue
        if f_capacity and f_capacity.lower() not in str(specs.get("capacity", "")).lower():
            continue
        filtered_products.append(p)

    # Transform into ProductResponse with calculated Value Scores
    scored_products = []
    for p in filtered_products:
        scored_products.append(build_product_response(p, budget=p_max))

    # Apply sorting
    if s_by == "price_asc":
        scored_products.sort(key=lambda x: x.current_best_price or 9999999)
    elif s_by == "price_desc":
        scored_products.sort(key=lambda x: x.current_best_price or 0, reverse=True)
    elif s_by == "quality_desc":
        scored_products.sort(key=lambda x: x.quality_score, reverse=True)
    elif s_by == "best_value":
        scored_products.sort(key=lambda x: x.best_value_score or 0, reverse=True)
    else:
        scored_products.sort(key=lambda x: x.best_value_score or 0, reverse=True)

    total = len(scored_products)
    start = (p_num - 1) * s_num
    end = start + s_num
    paginated_items = scored_products[start:end]
    pages = (total + s_num - 1) // s_num if total > 0 else 1

    return PaginatedProductsResponse(
        items=paginated_items,
        total=total,
        page=p_num,
        size=s_num,
        pages=pages,
        active_filters=active_filters
    )


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.variants),
        joinedload(Product.listings).joinedload(RetailerListing.retailer)
    ).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Evaluate Value Score Breakdown
    best_listing = product.listings[0] if product.listings else None
    eval_res = ScoringEngine.evaluate_product(
        price=product.current_best_price or product.base_mrp,
        base_quality=product.quality_score,
        rating=best_listing.rating if best_listing else 4.2,
        review_count=best_listing.review_count if best_listing else 300,
        brand_trust_score=product.brand.trust_score if product.brand else 80.0,
        warranty_months=best_listing.warranty_months if best_listing else 12,
        return_days=best_listing.return_days if best_listing else 7,
        retailer_rating=best_listing.retailer.rating if (best_listing and best_listing.retailer) else 4.5
    )

    # Unit price calculation
    norm_price, unit_display = UnitPriceService.calculate_unit_price(
        price=product.current_best_price or product.base_mrp,
        quantity=product.unit_quantity,
        unit_measure=product.unit_measure
    )

    # Serialize
    prod_resp = build_product_response(product)
    
    # Sort listings by estimated_total_cost
    sorted_listings = sorted(product.listings, key=lambda x: x.estimated_total_cost)

    return ProductDetailResponse(
        **prod_resp.model_dump(),
        variants=product.variants,
        listings=sorted_listings,
        value_score_breakdown=ValueScoreBreakdown(
            overall_score=eval_res["overall_score"],
            quality_score=eval_res["quality_score"],
            affordability_score=eval_res["affordability_score"],
            reliability_score=eval_res["reliability_score"],
            weights_applied=eval_res["weights_applied"],
            explainability_reasons=eval_res["explainability_reasons"]
        ),
        unit_price_display=unit_display
    )


@router.get("/{product_id}/price-history", response_model=PriceHistoryResponse)
def get_product_price_history(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Fetch all price observations for all listings of this product
    observations = (
        db.query(PriceObservation)
        .join(PriceObservation.listing)
        .options(joinedload(PriceObservation.listing).joinedload(RetailerListing.retailer))
        .filter(RetailerListing.product_id == product_id)
        .order_by(PriceObservation.recorded_at.asc())
        .all()
    )

    return PriceHistoryService.analyze_price_history(
        observations=observations,
        current_best_price=product.current_best_price or product.base_mrp,
        product_title=product.title,
        product_id=product.id
    )
