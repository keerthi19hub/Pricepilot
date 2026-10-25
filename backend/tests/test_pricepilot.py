import pytest
from backend.app.core.database import SessionLocal
from backend.app.main import health_check
from backend.app.api.categories import get_categories
from backend.app.api.products import get_products, get_product_detail, get_product_price_history
from backend.app.api.recommendations import budget_based_recommendations, get_featured_recommendations
from backend.app.api.comparisons import compare_products_workspace
from backend.app.schemas.schemas import BudgetFinderRequest, ProductCompareRequest, UserCreate
from backend.app.api.auth import register
from backend.app.services.scoring_engine import ScoringEngine
from backend.app.services.matching_engine import MatchingEngine
from backend.app.services.unit_price_service import UnitPriceService
from backend.app.services.price_history_service import PriceHistoryService

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# ----------------- Service Tests -----------------

def test_scoring_engine_calculation():
    result = ScoringEngine.evaluate_product(
        price=14999.0,
        base_quality=82.0,
        rating=4.3,
        review_count=5000,
        brand_trust_score=85.0,
        warranty_months=12,
        return_days=7,
        budget=15000.0
    )
    assert "overall_score" in result
    assert 0 <= result["overall_score"] <= 100
    assert result["affordability_score"] >= 70.0
    assert len(result["explainability_reasons"]) > 0
    assert any("Comfortably inside budget" in r or "Right on target" in r for r in result["explainability_reasons"])

def test_scoring_engine_over_budget_penalty():
    result = ScoringEngine.evaluate_product(
        price=22000.0,
        base_quality=90.0,
        rating=4.5,
        review_count=1000,
        budget=15000.0
    )
    assert result["affordability_score"] < 60.0
    assert any("Exceeds budget" in r for r in result["explainability_reasons"])

def test_matching_engine_variant_sensitivity():
    conf, status, meta = MatchingEngine.match_products(
        source_title="Redmi Note 13 5G 128GB Storage 6GB RAM",
        target_title="Redmi Note 13 5G 256GB Storage 8GB RAM",
        source_brand="Redmi",
        target_brand="Redmi"
    )
    assert status == "REJECTED"
    assert conf == 0.0
    assert "Material variant difference in storage" in meta["reason"]

def test_matching_engine_exact_gtin_match():
    conf, status, meta = MatchingEngine.match_products(
        source_title="Samsung Galaxy M34 5G Blue",
        target_title="Samsung M34 5G Waterfall Blue",
        source_brand="Samsung",
        target_brand="Samsung",
        source_gtin="8806095012345",
        target_gtin="8806095012345"
    )
    assert status == "CONFIRMED"
    assert conf == 100.0

def test_unit_price_service_calculations():
    norm_price, label = UnitPriceService.calculate_unit_price(price=379.0, quantity=50.0, unit_measure="g")
    assert norm_price == 758.0
    assert "per 100 g" in label

    norm_price_ml, label_ml = UnitPriceService.calculate_unit_price(price=499.0, quantity=30.0, unit_measure="ml")
    assert norm_price_ml == 1663.33
    assert "per 100 ml" in label_ml

def test_price_history_service_insufficient_data():
    res = PriceHistoryService.analyze_price_history(
        observations=[],
        current_best_price=1000.0,
        product_title="Test Product",
        product_id=1
    )
    assert res["has_sufficient_history"] is False
    assert res["deal_rating"] == "INSUFFICIENT_DATA"
    assert "Price history is not yet available" in res["deal_explanation"]

# ----------------- Endpoint Logic & Integration Tests -----------------

def test_health_check_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["app"] == "PricePilot"

def test_categories_endpoint(db):
    cats = get_categories(db=db)
    assert len(cats) >= 10
    slugs = [c.slug for c in cats]
    assert "electronics" in slugs
    assert "beauty-and-skincare" in slugs
    assert "appliances" in slugs

def test_universal_search_products(db):
    # Search for smartphone under 16000
    res = get_products(q="smartphone under 16000", db=db)
    assert res.total > 0
    assert len(res.items) > 0
    for item in res.items:
        assert item.current_best_price <= 16000.0

def test_product_detail_endpoint(db):
    list_res = get_products(db=db)
    first_id = list_res.items[0].id

    detail = get_product_detail(product_id=first_id, db=db)
    assert detail.id == first_id
    assert len(detail.listings) > 0
    assert detail.value_score_breakdown is not None
    assert detail.value_score_breakdown.overall_score > 0

def test_product_price_history_endpoint(db):
    list_res = get_products(db=db)
    first_id = list_res.items[0].id

    history = get_product_price_history(product_id=first_id, db=db)
    assert history["has_sufficient_history"] is True
    assert history["observation_count"] >= 3
    assert history["lowest_recorded_price"] > 0
    assert len(history["observations"]) >= 3

def test_budget_finder_endpoint(db):
    req = BudgetFinderRequest(
        budget=16000.0,
        category_slug="electronics",
        priority="balanced"
    )
    res = budget_based_recommendations(req=req, db=db)
    assert res.budget == 16000.0
    assert res.best_overall_value is not None
    assert res.best_budget_pick is not None
    assert res.best_quality_pick is not None
    assert res.best_overall_value.badge_type == "BEST_OVERALL_VALUE"
    assert res.best_budget_pick.badge_type == "BEST_BUDGET_PICK"
    assert res.best_quality_pick.badge_type == "BEST_QUALITY_WITHIN_BUDGET"

def test_comparison_workspace_endpoint(db):
    list_res = get_products(db=db)
    pids = [list_res.items[0].id, list_res.items[1].id]

    req = ProductCompareRequest(product_ids=pids)
    comp = compare_products_workspace(req=req, db=db)
    assert len(comp.products) == 2
    assert len(comp.spec_comparisons) > 0
    assert "PricePilot recommends" in comp.value_verdict
    assert len(comp.verdict_reasons) > 0

def test_auth_registration(db):
    import uuid
    rand_email = f"user_{uuid.uuid4().hex[:8]}@pricepilot.com"
    req = UserCreate(
        email=rand_email,
        password="securepassword123",
        full_name="Alex Morgan"
    )
    res = register(user_in=req, db=db)
    assert res.access_token is not None
    assert res.user.email == rand_email
