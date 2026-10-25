from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.models import Category, Brand, Retailer
from backend.app.schemas.schemas import CategoryResponse, BrandResponse, RetailerResponse

router = APIRouter(tags=["Categories, Brands & Retailers"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    return [CategoryResponse.model_validate(c) for c in categories]

@router.get("/categories/{slug_or_id}", response_model=CategoryResponse)
def get_category_by_slug(slug_or_id: str, db: Session = Depends(get_db)):
    if slug_or_id.isdigit():
        cat = db.query(Category).filter(Category.id == int(slug_or_id)).first()
    else:
        cat = db.query(Category).filter(Category.slug == slug_or_id.lower()).first()
    
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse.model_validate(cat)

@router.get("/brands", response_model=List[BrandResponse])
def get_brands(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Brand)
    brands = query.order_by(Brand.name.asc()).all()
    return [BrandResponse.model_validate(b) for b in brands]

@router.get("/retailers", response_model=List[RetailerResponse])
def get_retailers(db: Session = Depends(get_db)):
    retailers = db.query(Retailer).filter(Retailer.is_active == True).order_by(Retailer.rating.desc()).all()
    return [RetailerResponse.model_validate(r) for r in retailers]
