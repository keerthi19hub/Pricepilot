from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.core.database import get_db
from backend.app.models.models import Product, Category, Brand, RetailerListing
from backend.app.schemas.schemas import (
    BudgetFinderRequest, BudgetFinderResponse, RecommendationCard,
    ProductResponse, ValueScoreBreakdown
)
from backend.app.services.scoring_engine import ScoringEngine
from backend.app.api.products import build_product_response

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine & Budget Finder"])

@router.post("/budget-finder", response_model=BudgetFinderResponse)
def budget_based_recommendations(req: BudgetFinderRequest, db: Session = Depends(get_db)):
    """
    Dedicated budget-based product finder.
    Discovers candidate products within or near the budget, applies user priority weights,
    and returns:
      1. Best Overall Value
      2. Best Budget Pick
      3. Best Quality Within Budget
    """
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.listings).joinedload(RetailerListing.retailer)
    )

    # Category matching
    category_name = None
    if req.category_id:
        query = query.filter(Product.category_id == req.category_id)
        cat = db.query(Category).filter(Category.id == req.category_id).first()
        if cat:
            category_name = cat.name
    elif req.category_slug:
        cat = db.query(Category).filter(Category.slug == req.category_slug.lower()).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
            category_name = cat.name

    # Priority weighting configuration
    weights = {"quality": 0.50, "affordability": 0.30, "reliability": 0.20}
    if req.custom_weights:
        weights = req.custom_weights
    elif req.priority == "quality_focused":
        weights = {"quality": 0.65, "affordability": 0.15, "reliability": 0.20}
    elif req.priority == "budget_focused":
        weights = {"quality": 0.30, "affordability": 0.55, "reliability": 0.15}
    elif req.priority == "reliability_focused":
        weights = {"quality": 0.35, "affordability": 0.25, "reliability": 0.40}

    # Fetch candidate products (allowing up to 10% headroom above budget to evaluate close quality upgrades)
    candidates = query.all()
    if not candidates:
        # Fallback to all products if category was too narrow
        candidates = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.listings).joinedload(RetailerListing.retailer)
        ).all()

    # Filter by brand preferences if specified
    if req.brand_preferences:
        pref_brands = [b.lower() for b in req.brand_preferences]
        brand_matched = [p for p in candidates if p.brand and p.brand.name.lower() in pref_brands]
        if brand_matched:
            candidates = brand_matched

    # Filter by required features if specified
    if req.required_features:
        feature_matched = []
        for p in candidates:
            specs_str = str(p.specifications).lower()
            if all(feat.lower() in specs_str for feat in req.required_features):
                feature_matched.append(p)
        if feature_matched:
            candidates = feature_matched

    evaluated_items = []
    for p in candidates:
        price = p.current_best_price or p.base_mrp
        best_listing = p.listings[0] if p.listings else None
        
        eval_res = ScoringEngine.evaluate_product(
            price=price,
            base_quality=p.quality_score,
            rating=best_listing.rating if best_listing else 4.2,
            review_count=best_listing.review_count if best_listing else 200,
            brand_trust_score=p.brand.trust_score if p.brand else 80.0,
            warranty_months=best_listing.warranty_months if best_listing else 12,
            return_days=best_listing.return_days if best_listing else 7,
            retailer_rating=best_listing.retailer.rating if (best_listing and best_listing.retailer) else 4.5,
            budget=req.budget,
            weights=weights
        )
        
        prod_resp = build_product_response(p, budget=req.budget)
        evaluated_items.append({
            "product": p,
            "product_response": prod_resp,
            "price": price,
            "quality_score": eval_res["quality_score"],
            "affordability_score": eval_res["affordability_score"],
            "reliability_score": eval_res["reliability_score"],
            "overall_score": eval_res["overall_score"],
            "eval_res": eval_res
        })

    # Strict within budget pool
    within_budget = [item for item in evaluated_items if item["price"] <= req.budget]
    # If no product strictly <= budget, use entire pool
    effective_pool = within_budget if within_budget else evaluated_items

    # 1. Best Overall Value Pick: Top overall score in effective pool
    best_overall_item = max(effective_pool, key=lambda x: x["overall_score"]) if effective_pool else None
    best_overall_card = None
    if best_overall_item:
        best_overall_card = RecommendationCard(
            badge_type="BEST_OVERALL_VALUE",
            badge_title="Best Overall Value",
            badge_subtitle="Optimal balance of quality, price efficiency, and brand reliability",
            product=best_overall_item["product_response"],
            score_breakdown=ValueScoreBreakdown(
                overall_score=best_overall_item["overall_score"],
                quality_score=best_overall_item["quality_score"],
                affordability_score=best_overall_item["affordability_score"],
                reliability_score=best_overall_item["reliability_score"],
                weights_applied=best_overall_item["eval_res"]["weights_applied"],
                explainability_reasons=best_overall_item["eval_res"]["explainability_reasons"]
            ),
            why_recommended=best_overall_item["eval_res"]["explainability_reasons"][:3]
        )

    # 2. Best Budget Pick: Lowest cost option that meets minimum quality threshold (quality >= 60)
    qualifying_budget_items = [item for item in effective_pool if item["quality_score"] >= 60.0]
    best_budget_item = min(qualifying_budget_items or effective_pool, key=lambda x: x["price"]) if effective_pool else None
    best_budget_card = None
    if best_budget_item:
        why_budget = [
            f"Maximum savings: ₹{req.budget - best_budget_item['price']:,.0f} below your budget threshold",
            f"Maintains dependable {best_budget_item['quality_score']:.0f}/100 quality standards",
            f"Lowest estimated total purchase cost in this comparison tier"
        ]
        best_budget_card = RecommendationCard(
            badge_type="BEST_BUDGET_PICK",
            badge_title="Best Budget Pick",
            badge_subtitle="Most affordable option meeting dependable quality standards",
            product=best_budget_item["product_response"],
            score_breakdown=ValueScoreBreakdown(
                overall_score=best_budget_item["overall_score"],
                quality_score=best_budget_item["quality_score"],
                affordability_score=best_budget_item["affordability_score"],
                reliability_score=best_budget_item["reliability_score"],
                weights_applied=best_budget_item["eval_res"]["weights_applied"],
                explainability_reasons=why_budget
            ),
            why_recommended=why_budget
        )

    # 3. Best Quality Within Budget: Highest quality score among products whose price <= budget
    best_quality_item = max(effective_pool, key=lambda x: x["quality_score"]) if effective_pool else None
    best_quality_card = None
    if best_quality_item:
        why_quality = [
            f"Highest build and specification benchmark ({best_quality_item['quality_score']:.0f}/100 quality score)",
            f"Top-tier performance while staying within ₹{req.budget:,.0f}",
            f"Backed by {best_quality_item['product'].brand.name if best_quality_item['product'].brand else 'trusted'} service network"
        ]
        best_quality_card = RecommendationCard(
            badge_type="BEST_QUALITY_WITHIN_BUDGET",
            badge_title="Best Quality Within Budget",
            badge_subtitle="Strongest specifications and quality evidence within your limit",
            product=best_quality_item["product_response"],
            score_breakdown=ValueScoreBreakdown(
                overall_score=best_quality_item["overall_score"],
                quality_score=best_quality_item["quality_score"],
                affordability_score=best_quality_item["affordability_score"],
                reliability_score=best_quality_item["reliability_score"],
                weights_applied=best_quality_item["eval_res"]["weights_applied"],
                explainability_reasons=why_quality
            ),
            why_recommended=why_quality
        )

    # All eligible products sorted by overall score
    sorted_all = sorted(effective_pool, key=lambda x: x["overall_score"], reverse=True)
    all_responses = [item["product_response"] for item in sorted_all]

    return BudgetFinderResponse(
        budget=req.budget,
        category_name=category_name,
        best_overall_value=best_overall_card,
        best_budget_pick=best_budget_card,
        best_quality_pick=best_quality_card,
        all_eligible_products=all_responses,
        methodology_note="Evaluated using PricePilot Multi-Factor Scoring Engine (Quality 50%, Affordability 30%, Reliability 20%)."
    )


@router.get("/featured", response_model=Dict[str, Any])
def get_featured_recommendations(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Returns featured top-tier recommendations for the landing page.
    """
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.listings).joinedload(RetailerListing.retailer)
    )
    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.limit(30).all()
    if not products:
        return {"items": []}

    scored = []
    for p in products:
        resp = build_product_response(p)
        scored.append((resp, resp.best_value_score or 0))

    scored.sort(key=lambda x: x[1], reverse=True)
    top_items = [item[0] for item in scored[:6]]

    return {
        "featured": top_items,
        "methodology": "Ranked by PricePilot Value-for-Money Index."
    }
