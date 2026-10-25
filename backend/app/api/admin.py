from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.security import get_current_admin
from backend.app.models.models import (
    User, Product, Category, Retailer, RetailerListing, PriceObservation,
    ProductMatchCandidate, DataIngestionAudit
)
from backend.app.schemas.schemas import (
    IngestionAuditResponse, MatchCandidateResponse, MatchCandidateUpdate
)
from backend.app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & Operations"])

@router.get("/overview")
def get_admin_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_products = db.query(Product).count()
    total_retailers = db.query(Retailer).count()
    total_listings = db.query(RetailerListing).count()
    total_observations = db.query(PriceObservation).count()
    total_users = db.query(User).count()
    pending_match_candidates = db.query(ProductMatchCandidate).filter(ProductMatchCandidate.status == "TENTATIVE").count()
    recent_audits = db.query(DataIngestionAudit).order_by(DataIngestionAudit.created_at.desc()).limit(5).all()

    # Retailer status breakdown
    retailers = db.query(Retailer).all()
    retailer_stats = []
    for r in retailers:
        l_count = db.query(RetailerListing).filter(RetailerListing.retailer_id == r.id).count()
        last_obs = (
            db.query(PriceObservation.recorded_at)
            .join(PriceObservation.listing)
            .filter(RetailerListing.retailer_id == r.id)
            .order_by(PriceObservation.recorded_at.desc())
            .first()
        )
        retailer_stats.append({
            "id": r.id,
            "name": r.name,
            "is_active": r.is_active,
            "is_partner": r.is_partner,
            "rating": r.rating,
            "listings_count": l_count,
            "last_synced": last_obs[0] if last_obs else None
        })

    return {
        "stats": {
            "total_products": total_products,
            "total_retailers": total_retailers,
            "total_listings": total_listings,
            "total_observations": total_observations,
            "total_users": total_users,
            "pending_matches": pending_match_candidates
        },
        "retailers": retailer_stats,
        "recent_audits": [IngestionAuditResponse.model_validate(a) for a in recent_audits]
    }


@router.post("/ingest/csv", response_model=IngestionAuditResponse)
async def upload_csv_data(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")

    content = await file.read()
    csv_text = content.decode("utf-8", errors="ignore")

    audit = IngestionService.ingest_csv_content(
        db=db,
        csv_text=csv_text,
        filename=file.filename,
        source_name=f"ADMIN_UPLOAD_{admin.email}"
    )

    return IngestionAuditResponse.model_validate(audit)


@router.get("/matches", response_model=List[MatchCandidateResponse])
def get_match_candidates(
    status: Optional[str] = "TENTATIVE",
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ProductMatchCandidate)
    if status:
        query = query.filter(ProductMatchCandidate.status == status)
    candidates = query.order_by(ProductMatchCandidate.created_at.desc()).all()
    return [MatchCandidateResponse.model_validate(c) for c in candidates]


@router.put("/matches/{candidate_id}", response_model=MatchCandidateResponse)
def resolve_match_candidate(
    candidate_id: int,
    update: MatchCandidateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    candidate = db.query(ProductMatchCandidate).filter(ProductMatchCandidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate match not found")

    candidate.status = update.status
    if update.rejection_reason:
        candidate.rejection_reason = update.rejection_reason
    db.commit()
    db.refresh(candidate)
    return MatchCandidateResponse.model_validate(candidate)


@router.post("/retailers/{retailer_id}/toggle-status")
def toggle_retailer_status(
    retailer_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    retailer = db.query(Retailer).filter(Retailer.id == retailer_id).first()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")

    retailer.is_active = not retailer.is_active
    db.commit()
    db.refresh(retailer)
    return {"id": retailer.id, "name": retailer.name, "is_active": retailer.is_active}
