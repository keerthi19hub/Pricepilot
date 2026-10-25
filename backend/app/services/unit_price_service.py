from typing import Optional, Tuple

class UnitPriceService:
    """
    Normalizes product prices across quantities, weights, and volumes.
    Supports:
      - Skincare / Liquids: Price per 100 ml
      - Packaged foods / Personal care: Price per 100 g
      - Bulk grocery: Price per 1 kg
      - Multipacks: Price per individual piece/unit
    """

    @classmethod
    def calculate_unit_price(
        cls,
        price: float,
        quantity: Optional[float],
        unit_measure: Optional[str]
    ) -> Tuple[Optional[float], Optional[str]]:
        """
        Returns (normalized_price, display_label).
        e.g. (120.0, "₹120 / 100 ml") or None if not applicable.
        """
        if not price or not quantity or quantity <= 0 or not unit_measure:
            return None, None

        measure = unit_measure.lower().strip()

        # Liquids (ml, l) -> normalize to per 100 ml
        if measure in ["ml", "milliliter", "millilitre"]:
            norm_price = (price / quantity) * 100.0
            return round(norm_price, 2), f"₹{norm_price:,.2f} per 100 ml"
        elif measure in ["l", "liter", "litre"]:
            total_ml = quantity * 1000.0
            norm_price = (price / total_ml) * 100.0
            return round(norm_price, 2), f"₹{norm_price:,.2f} per 100 ml"

        # Solids / Powders (g, gm, kg)
        elif measure in ["g", "gm", "gram", "grams"]:
            if quantity >= 1000:
                # Big pack -> normalize to per kg
                norm_price = (price / quantity) * 1000.0
                return round(norm_price, 2), f"₹{norm_price:,.2f} per kg"
            else:
                norm_price = (price / quantity) * 100.0
                return round(norm_price, 2), f"₹{norm_price:,.2f} per 100 g"
        elif measure in ["kg", "kilogram", "kilograms"]:
            norm_price = price / quantity
            return round(norm_price, 2), f"₹{norm_price:,.2f} per kg"

        # Count / Multipacks (piece, pack, count, unit)
        elif measure in ["piece", "pieces", "count", "pack", "unit", "units", "tablets", "capsules"]:
            norm_price = price / quantity
            return round(norm_price, 2), f"₹{norm_price:,.2f} per item"

        return None, None
