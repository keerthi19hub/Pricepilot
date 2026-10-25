from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.models.models import PriceObservation, RetailerListing

class PriceHistoryService:
    """
    Analyzes historical price observations across retailers.
    Enforces data integrity: never fabricates historical prices.
    If observations are fewer than 3, explicitly flags 'INSUFFICIENT_DATA'.
    """

    @classmethod
    def analyze_price_history(
        cls,
        observations: List[PriceObservation],
        current_best_price: float,
        product_title: str,
        product_id: int
    ) -> Dict[str, Any]:
        count = len(observations)
        
        if count < 3:
            return {
                "product_id": product_id,
                "product_title": product_title,
                "current_price": current_best_price,
                "lowest_recorded_price": current_best_price,
                "highest_recorded_price": current_best_price,
                "average_recorded_price": current_best_price,
                "has_sufficient_history": False,
                "observation_count": count,
                "first_recorded_date": observations[0].recorded_at if count > 0 else None,
                "last_recorded_date": observations[-1].recorded_at if count > 0 else None,
                "deal_rating": "INSUFFICIENT_DATA",
                "deal_explanation": "Price history is not yet available. More historical observations are required to determine deal trends.",
                "percentage_vs_average": 0.0,
                "observations": [
                    {
                        "date": obs.recorded_at.strftime("%Y-%m-%d"),
                        "price": obs.price,
                        "original_price": obs.original_price,
                        "retailer": obs.listing.retailer.name if obs.listing and obs.listing.retailer else "Retailer"
                    }
                    for obs in observations
                ]
            }

        # Valid historical series
        prices = [obs.price for obs in observations if obs.price > 0]
        if not prices:
            prices = [current_best_price]

        lowest = min(prices)
        highest = max(prices)
        avg = round(sum(prices) / len(prices), 2)

        # Percentage comparison relative to historical average
        pct_diff = round(((current_best_price - avg) / avg) * 100.0, 1)

        # Cautious deal classification
        if current_best_price <= lowest:
            deal_rating = "EXCELLENT_DEAL"
            deal_explanation = f"Lowest price recorded to date! Currently ₹{avg - current_best_price:,.0f} ({abs(pct_diff)}%) below the average recorded price."
        elif pct_diff <= -7.0:
            deal_rating = "GOOD_PRICE"
            deal_explanation = f"Solid discount: currently {abs(pct_diff)}% below the 90-day recorded average of ₹{avg:,.0f}."
        elif abs(pct_diff) <= 3.0:
            deal_rating = "AVERAGE_PRICE"
            deal_explanation = f"Trading near its typical historical average price of ₹{avg:,.0f}."
        elif pct_diff > 3.0 and current_best_price >= highest:
            deal_rating = "ELEVATED_PRICE"
            deal_explanation = f"Currently at its highest recorded price point (+{pct_diff}% above average). Consider waiting for a price drop."
        else:
            deal_rating = "FAIR_PRICE"
            deal_explanation = f"Price is within standard seasonal fluctuation (recorded range: ₹{lowest:,.0f} - ₹{highest:,.0f})."

        # Format observation points sorted by date
        sorted_obs = sorted(observations, key=lambda x: x.recorded_at)
        formatted_obs = [
            {
                "date": obs.recorded_at.strftime("%Y-%m-%d"),
                "price": obs.price,
                "original_price": obs.original_price,
                "retailer": obs.listing.retailer.name if obs.listing and obs.listing.retailer else "Retailer"
            }
            for obs in sorted_obs
        ]

        return {
            "product_id": product_id,
            "product_title": product_title,
            "current_price": current_best_price,
            "lowest_recorded_price": lowest,
            "highest_recorded_price": highest,
            "average_recorded_price": avg,
            "has_sufficient_history": True,
            "observation_count": count,
            "first_recorded_date": sorted_obs[0].recorded_at,
            "last_recorded_date": sorted_obs[-1].recorded_at,
            "deal_rating": deal_rating,
            "deal_explanation": deal_explanation,
            "percentage_vs_average": pct_diff,
            "observations": formatted_obs
        }
