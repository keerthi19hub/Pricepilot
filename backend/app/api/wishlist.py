from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.models import Wishlist, PriceAlert, Product, User, RetailerListing
from backend.app.schemas.schemas import (
    WishlistCreate, WishlistResponse, PriceAlertCreate, PriceAlertResponse
)
from backend.app.api.products import build_product_response

router = APIRouter(prefix="/wishlist", tags=["Wishlist & Price Alerts"])

@router.get("", response_model=List[WishlistResponse])
def get_user_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(Wishlist)
        .options(
            joinedload(Wishlist.product).joinedload(Product.brand),
            joinedload(Wishlist.product).joinedload(Product.category),
            joinedload(Wishlist.product).joinedload(Product.listings).joinedload(RetailerListing.retailer)
        )
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    result = []
    for w in items:
        prod_resp = build_product_response(w.product)
        drop = None
        if w.target_price and w.product.current_best_price:
            if w.product.current_best_price <= w.target_price:
                drop = w.target_price - w.product.current_best_price
        result.append(WishlistResponse(
            id=w.id,
            product=prod_resp,
            target_price=w.target_price,
            created_at=w.created_at,
            price_drop_amount=drop
        ))
    return result

@router.post("", response_model=WishlistResponse)
def add_to_wishlist(req: WishlistCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == req.product_id
    ).first()

    if existing:
        if req.target_price is not None:
            existing.target_price = req.target_price
            db.commit()
            db.refresh(existing)
        return WishlistResponse(
            id=existing.id,
            product=build_product_response(product),
            target_price=existing.target_price,
            created_at=existing.created_at
        )

    wishlist_item = Wishlist(
        user_id=current_user.id,
        product_id=req.product_id,
        target_price=req.target_price
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return WishlistResponse(
        id=wishlist_item.id,
        product=build_product_response(product),
        target_price=wishlist_item.target_price,
        created_at=wishlist_item.created_at
    )

@router.delete("/{wishlist_id}")
def remove_from_wishlist(wishlist_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Wishlist).filter(
        Wishlist.id == wishlist_id,
        Wishlist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Product removed from wishlist"}

@router.post("/alerts", response_model=PriceAlertResponse)
def create_price_alert(req: PriceAlertCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    alert = PriceAlert(
        user_id=current_user.id,
        product_id=req.product_id,
        desired_price=req.desired_price,
        is_active=True,
        triggered=(product.current_best_price is not None and product.current_best_price <= req.desired_price)
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return PriceAlertResponse(
        id=alert.id,
        product_id=product.id,
        product_title=product.title,
        current_price=product.current_best_price or product.base_mrp,
        desired_price=alert.desired_price,
        is_active=alert.is_active,
        triggered=alert.triggered,
        created_at=alert.created_at
    )

@router.get("/alerts", response_model=List[PriceAlertResponse])
def get_price_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = (
        db.query(PriceAlert)
        .join(PriceAlert.product)
        .filter(PriceAlert.user_id == current_user.id)
        .all()
    )
    return [
        PriceAlertResponse(
            id=a.id,
            product_id=a.product.id,
            product_title=a.product.title,
            current_price=a.product.current_best_price or a.product.base_mrp,
            desired_price=a.desired_price,
            is_active=a.is_active,
            triggered=a.triggered,
            created_at=a.created_at
        )
        for a in alerts
    ]
