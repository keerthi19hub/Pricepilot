import csv
import io
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.models import (
    Product, ProductVariant, Retailer, RetailerListing, PriceObservation,
    Brand, Category, DataIngestionAudit, ProductMatchCandidate
)
from backend.app.services.matching_engine import MatchingEngine

class IngestionService:
    """
    Ingests and validates product and retailer listing datasets from CSV/JSON.
    Records audit trails, duplicate detection checks, and updates prices.
    """

    @classmethod
    def ingest_csv_content(cls, db: Session, csv_text: str, filename: str = "upload.csv", source_name: str = "CSV_IMPORT") -> DataIngestionAudit:
        audit = DataIngestionAudit(
            source_name=source_name,
            filename=filename,
            records_processed=0,
            records_valid=0,
            records_failed=0,
            errors=[]
        )
        db.add(audit)
        db.commit()

        f = io.StringIO(csv_text.strip())
        reader = csv.DictReader(f)
        
        errors_list = []
        valid_count = 0
        failed_count = 0
        row_idx = 1

        for row in reader:
            audit.records_processed += 1
            row_idx += 1
            try:
                title = row.get("title", "").strip()
                brand_name = row.get("brand", "").strip()
                category_slug = row.get("category", "").strip().lower()
                price_str = row.get("price", "").strip()
                retailer_name = row.get("retailer", "").strip()
                product_url = row.get("url", "").strip()

                if not title or not price_str or not retailer_name:
                    raise ValueError(f"Row {row_idx}: Missing required fields (title, price, or retailer)")

                price = float(price_str.replace("₹", "").replace(",", ""))
                mrp_str = row.get("mrp", "")
                mrp = float(mrp_str.replace("₹", "").replace(",", "")) if mrp_str else price

                # Resolve or create Brand
                brand = db.query(Brand).filter(Brand.name.ilike(brand_name)).first()
                if not brand and brand_name:
                    brand = Brand(name=brand_name, slug=brand_name.lower().replace(" ", "-"), trust_score=80.0)
                    db.add(brand)
                    db.flush()

                # Resolve Category
                category = db.query(Category).filter(
                    (Category.slug == category_slug) | (Category.name.ilike(category_slug))
                ).first()
                if not category:
                    category = db.query(Category).first()

                # Resolve Retailer
                retailer = db.query(Retailer).filter(Retailer.name.ilike(retailer_name)).first()
                if not retailer:
                    retailer = Retailer(
                        name=retailer_name,
                        slug=retailer_name.lower().replace(" ", "-"),
                        is_active=True,
                        website_url=product_url
                    )
                    db.add(retailer)
                    db.flush()

                # Check for existing product match using MatchingEngine
                existing_products = db.query(Product).filter(
                    Product.brand_id == (brand.id if brand else None)
                ).all()

                matched_product = None
                for ep in existing_products:
                    conf, status, meta = MatchingEngine.match_products(
                        source_title=title,
                        target_title=ep.title,
                        source_brand=brand.name if brand else "",
                        target_brand=ep.brand.name if ep.brand else "",
                        source_gtin=row.get("gtin"),
                        target_gtin=ep.gtin_ean,
                        source_model=row.get("model_number"),
                        target_model=ep.model_number
                    )
                    if status == "CONFIRMED":
                        matched_product = ep
                        break
                    elif status == "TENTATIVE":
                        # Record candidate for review
                        cand = ProductMatchCandidate(
                            source_title=title,
                            source_retailer=retailer.name,
                            source_sku=row.get("sku"),
                            source_price=price,
                            candidate_product_id=ep.id,
                            confidence_score=conf,
                            status="TENTATIVE",
                            matched_attributes=meta
                        )
                        db.add(cand)

                if not matched_product:
                    # Create new product
                    matched_product = Product(
                        title=title,
                        brand_id=brand.id if brand else 1,
                        category_id=category.id if category else 1,
                        model_number=row.get("model_number"),
                        gtin_ean=row.get("gtin"),
                        base_mrp=mrp,
                        current_best_price=price,
                        description=row.get("description", f"{title} from {brand_name}"),
                        primary_image=row.get("image_url", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"),
                        specifications={},
                        quality_score=float(row.get("quality_score", 78.0)),
                        reliability_score=float(row.get("reliability_score", 80.0))
                    )
                    db.add(matched_product)
                    db.flush()

                # Add or update retailer listing
                listing = db.query(RetailerListing).filter(
                    RetailerListing.product_id == matched_product.id,
                    RetailerListing.retailer_id == retailer.id
                ).first()

                if not listing:
                    listing = RetailerListing(
                        product_id=matched_product.id,
                        retailer_id=retailer.id,
                        product_url=product_url or "https://example.com",
                        title_at_retailer=title,
                        listed_price=price,
                        original_price=mrp,
                        discount_percent=round(((mrp - price) / mrp) * 100.0, 1) if mrp > price else 0.0,
                        in_stock=True,
                        estimated_total_cost=price,
                        source_type="IMPORT",
                        is_verified_live=False
                    )
                    db.add(listing)
                    db.flush()
                else:
                    listing.listed_price = price
                    listing.original_price = mrp
                    listing.last_verified_at = datetime.now(timezone.utc)

                # Add price observation
                obs = PriceObservation(
                    listing_id=listing.id,
                    price=price,
                    original_price=mrp,
                    recorded_at=datetime.now(timezone.utc)
                )
                db.add(obs)

                # Update product best price
                if matched_product.current_best_price is None or price < matched_product.current_best_price:
                    matched_product.current_best_price = price

                valid_count += 1
            except Exception as e:
                failed_count += 1
                errors_list.append(f"Row {row_idx}: {str(e)}")

        audit.records_valid = valid_count
        audit.records_failed = failed_count
        audit.errors = errors_list[:50] # Top 50 errors
        db.commit()
        db.refresh(audit)
        return audit
