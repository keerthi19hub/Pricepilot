from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.models import Product, RetailerListing, SavedComparison, User
from backend.app.schemas.schemas import (
    ProductCompareRequest, ComparisonWorkspaceResponse,
    AttributeComparison, ProductDetailResponse, SavedComparisonCreate, SavedComparisonResponse
)
from backend.app.api.products import get_product_detail

router = APIRouter(prefix="/comparisons", tags=["Product Comparison Workspace"])

@router.post("/workspace", response_model=ComparisonWorkspaceResponse)
def compare_products_workspace(req: ProductCompareRequest, db: Session = Depends(get_db)):
    if len(req.product_ids) < 2 or len(req.product_ids) > 4:
        raise HTTPException(status_code=400, detail="Comparison workspace requires between 2 and 4 products.")

    products_detail: List[ProductDetailResponse] = []
    for pid in req.product_ids:
        try:
            p_det = get_product_detail(product_id=pid, db=db)
            products_detail.append(p_det)
        except HTTPException:
            raise HTTPException(status_code=404, detail=f"Product with ID {pid} was not found.")

    # Collect all specification keys across compared products
    all_spec_keys = set()
    for p in products_detail:
        if p.specifications:
            all_spec_keys.update(p.specifications.keys())

    # Build attribute comparisons and flag differing values
    spec_comparisons: List[AttributeComparison] = []
    for key in sorted(list(all_spec_keys)):
        val_map = {}
        distinct_vals = set()
        for p in products_detail:
            val = p.specifications.get(key, "Not Specified") if p.specifications else "Not Specified"
            val_map[str(p.id)] = val
            distinct_vals.add(str(val).lower().strip())
        
        is_different = (len(distinct_vals) > 1)
        # Format label e.g. "battery_mah" -> "Battery Mah"
        label = key.replace("_", " ").title()
        spec_comparisons.append(AttributeComparison(
            attribute_key=key,
            attribute_label=label,
            is_different=is_different,
            values_by_product_id=val_map
        ))

    # Add core product attributes (Price, Quality Score, Reliability, Warranty)
    price_map = {str(p.id): f"₹{p.current_best_price:,.0f}" if p.current_best_price else "N/A" for p in products_detail}
    spec_comparisons.insert(0, AttributeComparison(
        attribute_key="best_price",
        attribute_label="Lowest Listed Price",
        is_different=len(set(price_map.values())) > 1,
        values_by_product_id=price_map
    ))

    quality_map = {str(p.id): f"{p.quality_score:.0f} / 100" for p in products_detail}
    spec_comparisons.insert(1, AttributeComparison(
        attribute_key="quality_score",
        attribute_label="Quality Benchmark Score",
        is_different=len(set(quality_map.values())) > 1,
        values_by_product_id=quality_map
    ))

    vfm_map = {str(p.id): f"{p.best_value_score:.0f} / 100" if p.best_value_score else "N/A" for p in products_detail}
    spec_comparisons.insert(2, AttributeComparison(
        attribute_key="value_score",
        attribute_label="Value-for-Money Index",
        is_different=len(set(vfm_map.values())) > 1,
        values_by_product_id=vfm_map
    ))

    # Compare Prices and Retailer Listings
    lowest_prod = min(products_detail, key=lambda x: x.current_best_price or 9999999)
    highest_quality_prod = max(products_detail, key=lambda x: x.quality_score)
    highest_vfm_prod = max(products_detail, key=lambda x: x.best_value_score or 0)

    price_diff = (max(p.current_best_price or 0 for p in products_detail) - (lowest_prod.current_best_price or 0))

    # Formulate explainable verdict
    verdict_reasons = []
    verdict_reasons.append(
        f"'{highest_vfm_prod.title}' secures the highest PricePilot Value-for-Money rating ({highest_vfm_prod.best_value_score:.0f}/100) due to its balanced price-to-features ratio."
    )
    if lowest_prod.id != highest_quality_prod.id:
        verdict_reasons.append(
            f"If saving money is your primary goal, '{lowest_prod.title}' saves ₹{price_diff:,.0f} compared to the top-tier option while still delivering solid everyday utility."
        )
    if highest_quality_prod.id != highest_vfm_prod.id:
        verdict_reasons.append(
            f"For uncompromised build quality and premium hardware specs, '{highest_quality_prod.title}' leads the pack with a {highest_quality_prod.quality_score:.0f}/100 quality score."
        )

    best_for = {
        "Best Overall Value": highest_vfm_prod.title,
        "Best on a Tight Budget": lowest_prod.title,
        "Best Premium Performance": highest_quality_prod.title
    }

    return ComparisonWorkspaceResponse(
        products=products_detail,
        spec_comparisons=spec_comparisons,
        price_comparisons={
            "lowest_price": lowest_prod.current_best_price,
            "lowest_product_id": lowest_prod.id,
            "max_price_spread": price_diff
        },
        value_verdict=f"PricePilot recommends '{highest_vfm_prod.title}' as the smartest purchase among these selections.",
        verdict_reasons=verdict_reasons,
        best_for_scenarios=best_for
    )


@router.post("/saved", response_model=SavedComparisonResponse)
def save_comparison(
    req: SavedComparisonCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to persist saved comparisons.")

    saved = SavedComparison(
        user_id=current_user.id,
        title=req.title,
        product_ids=req.product_ids,
        notes=req.notes
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return SavedComparisonResponse(
        id=saved.id,
        title=saved.title,
        product_ids=saved.product_ids,
        notes=saved.notes,
        created_at=saved.created_at
    )


@router.get("/saved", response_model=List[SavedComparisonResponse])
def get_saved_comparisons(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []
    items = db.query(SavedComparison).filter(SavedComparison.user_id == current_user.id).all()
    return [
        SavedComparisonResponse(
            id=item.id,
            title=item.title,
            product_ids=item.product_ids,
            notes=item.notes,
            created_at=item.created_at
        )
        for item in items
    ]
