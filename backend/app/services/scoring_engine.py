from typing import Dict, List, Optional, Any, Tuple
import math

class ScoringEngine:
    """
    Transparent, explainable recommendation engine for PricePilot.
    Calculates:
      1. Quality Score (default weight 0.50)
      2. Affordability Score (default weight 0.30)
      3. Reliability Score (default weight 0.20)
    Generates transparent explainability justifications based strictly on available evidence.
    """

    @staticmethod
    def calculate_affordability_score(price: float, budget: Optional[float] = None, category_max_price: Optional[float] = None) -> float:
        """
        Calculates an affordability score (0 to 100).
        Lower price yields higher affordability.
        If a budget is specified:
          - If price <= budget, score scales from 70 to 100 as price drops below budget.
          - If price > budget, score decays sharply from 60 down to 0.
        """
        if price <= 0:
            return 50.0

        if budget and budget > 0:
            if price <= budget:
                # Savings ratio: fraction of budget saved
                savings_ratio = (budget - price) / budget
                return min(100.0, 70.0 + (savings_ratio * 30.0))
            else:
                # Over-budget penalty
                over_ratio = (price - budget) / budget
                return max(0.0, 60.0 - (over_ratio * 120.0))
        
        # When no explicit budget is set, normalize against a standard or category benchmark
        ref_price = category_max_price if (category_max_price and category_max_price > price) else (price * 1.5)
        ratio = max(0.0, min(1.0, 1.0 - (price / ref_price)))
        return round(40.0 + (ratio * 60.0), 1)

    @staticmethod
    def calculate_reliability_score(
        warranty_months: int = 12,
        return_days: int = 7,
        brand_trust_score: float = 80.0,
        retailer_rating: float = 4.5
    ) -> Tuple[float, List[str]]:
        """
        Calculates a reliability score (0 to 100) and returns supporting reasons.
        """
        reasons = []
        
        # Warranty component (up to 35 points)
        if warranty_months >= 24:
            warranty_pts = 35.0
            reasons.append(f"Extended {warranty_months}-month warranty protection")
        elif warranty_months >= 12:
            warranty_pts = 30.0
            reasons.append(f"Standard {warranty_months}-month manufacturer warranty")
        elif warranty_months >= 6:
            warranty_pts = 20.0
            reasons.append(f"{warranty_months}-month limited warranty")
        elif warranty_months > 0:
            warranty_pts = 10.0
            reasons.append(f"Short {warranty_months}-month warranty")
        else:
            warranty_pts = 5.0
            reasons.append("No explicit manufacturer warranty listed")

        # Return policy component (up to 25 points)
        if return_days >= 15:
            return_pts = 25.0
            reasons.append(f"Generous {return_days}-day return/replacement window")
        elif return_days >= 7:
            return_pts = 20.0
            reasons.append(f"{return_days}-day return/replacement policy")
        elif return_days > 0:
            return_pts = 12.0
            reasons.append(f"Limited {return_days}-day return policy")
        else:
            return_pts = 5.0
            reasons.append("Non-returnable item policy")

        # Brand trust component (up to 25 points)
        brand_pts = min(25.0, (brand_trust_score / 100.0) * 25.0)
        if brand_trust_score >= 85:
            reasons.append("Backed by a well-established brand with responsive support")

        # Retailer reliability component (up to 15 points)
        retailer_pts = min(15.0, (retailer_rating / 5.0) * 15.0)

        total_reliability = round(min(100.0, warranty_pts + return_pts + brand_pts + retailer_pts), 1)
        return total_reliability, reasons

    @staticmethod
    def calculate_quality_score(
        base_quality: float = 75.0,
        rating: Optional[float] = None,
        review_count: int = 0,
        brand_score: float = 80.0
    ) -> Tuple[float, List[str]]:
        """
        Calculates quality score using Bayesian average rating adjustment to prevent
        a 5-star product with 2 reviews from outranking a 4.6-star product with 10,000 reviews.
        """
        reasons = []
        
        # Bayesian rating estimation
        prior_rating = 4.0
        confidence_weight = 30 # Number of virtual reviews needed
        
        if rating is not None and rating > 0:
            adjusted_rating = ((confidence_weight * prior_rating) + (review_count * rating)) / (confidence_weight + review_count)
            rating_pts = (adjusted_rating / 5.0) * 45.0
            if review_count >= 1000 and rating >= 4.3:
                reasons.append(f"Highly rated ({rating}★ from {review_count:,} verified reviews)")
            elif review_count >= 100:
                reasons.append(f"Favorable customer feedback ({rating}★ based on {review_count} ratings)")
            elif review_count > 0:
                reasons.append(f"Emerging feedback ({rating}★, low sample size of {review_count} reviews)")
        else:
            rating_pts = (prior_rating / 5.0) * 45.0
            reasons.append("No independent customer rating data available yet")

        # Specs & build quality component (up to 40 points)
        spec_pts = (base_quality / 100.0) * 40.0
        if base_quality >= 85:
            reasons.append("High-tier specifications and premium hardware/formulation")
        elif base_quality >= 75:
            reasons.append("Solid competitive specifications in its tier")

        # Brand reputation component (up to 15 points)
        brand_pts = (brand_score / 100.0) * 15.0

        total_quality = round(min(100.0, rating_pts + spec_pts + brand_pts), 1)
        return total_quality, reasons

    @classmethod
    def evaluate_product(
        cls,
        price: float,
        base_quality: float,
        rating: Optional[float] = None,
        review_count: int = 0,
        brand_trust_score: float = 80.0,
        warranty_months: int = 12,
        return_days: int = 7,
        retailer_rating: float = 4.5,
        budget: Optional[float] = None,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Full evaluation of a product value proposition.
        Returns overall score, sub-scores, weights, and human-readable explanation.
        """
        if weights is None:
            # Configurable starting defaults: Quality 50%, Affordability 30%, Reliability 20%
            weights = {"quality": 0.50, "affordability": 0.30, "reliability": 0.20}
        
        # Normalize weights to sum to 1.0
        total_w = sum(weights.values())
        norm_weights = {k: v / total_w for k, v in weights.items()}

        quality_score, q_reasons = cls.calculate_quality_score(
            base_quality=base_quality,
            rating=rating,
            review_count=review_count,
            brand_score=brand_trust_score
        )
        
        affordability_score = cls.calculate_affordability_score(price=price, budget=budget)
        
        reliability_score, r_reasons = cls.calculate_reliability_score(
            warranty_months=warranty_months,
            return_days=return_days,
            brand_trust_score=brand_trust_score,
            retailer_rating=retailer_rating
        )

        overall_score = round(
            (quality_score * norm_weights.get("quality", 0.5)) +
            (affordability_score * norm_weights.get("affordability", 0.3)) +
            (reliability_score * norm_weights.get("reliability", 0.2)),
            1
        )

        # Build explainability bullet points
        explanations = []
        if budget and price <= budget:
            diff = budget - price
            if diff > 0:
                explanations.append(f"Comfortably inside budget (₹{diff:,.0f} under your ₹{budget:,.0f} limit)")
            else:
                explanations.append(f"Right on target at ₹{price:,.0f}")
        elif budget and price > budget:
            explanations.append(f"Exceeds budget by ₹{price - budget:,.0f}")

        explanations.extend(q_reasons)
        explanations.extend(r_reasons)

        return {
            "overall_score": overall_score,
            "quality_score": quality_score,
            "affordability_score": affordability_score,
            "reliability_score": reliability_score,
            "weights_applied": norm_weights,
            "explainability_reasons": explanations
        }
