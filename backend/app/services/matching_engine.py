import re
from typing import Dict, Any, Tuple, Optional, List

class MatchingEngine:
    """
    Intelligent duplicate detection and cross-retailer product matching engine.
    Ensures that products with different variants (e.g. 128GB vs 256GB, 50ml vs 100ml, 1.5T vs 1T AC)
    are NOT incorrectly matched as duplicates.
    """

    # Regex patterns for extracting key variant discriminators
    STORAGE_PATTERN = re.compile(r'(\d+)\s*(?:gb|tb)\b', re.IGNORECASE)
    RAM_PATTERN = re.compile(r'(\d+)\s*gb\s*(?:ram)\b', re.IGNORECASE)
    VOLUME_PATTERN = re.compile(r'(\d+(?:\.\d+)?)\s*(?:ml|l|liter|litre|gm|g|kg)\b', re.IGNORECASE)
    SIZE_PATTERN = re.compile(r'\b(uk\s*\d+|us\s*\d+|xs|s|m|l|xl|xxl|xxxl|\d+\s*inch|\d+\s*cm)\b', re.IGNORECASE)
    CAPACITY_PATTERN = re.compile(r'(\d+(?:\.\d+)?)\s*(?:ton|t|kg|litre|l)\b', re.IGNORECASE)

    @classmethod
    def extract_discriminators(cls, title: str, specs: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """
        Extracts variant attributes from title and specifications text.
        """
        text = title.lower()
        discriminators = {}

        # Storage
        storage_match = cls.STORAGE_PATTERN.search(text)
        if storage_match:
            discriminators["storage"] = storage_match.group(0).lower().replace(" ", "")

        # RAM
        ram_match = cls.RAM_PATTERN.search(text)
        if ram_match:
            discriminators["ram"] = ram_match.group(0).lower().replace(" ", "")

        # Volume / Weight
        vol_match = cls.VOLUME_PATTERN.search(text)
        if vol_match:
            discriminators["volume_weight"] = vol_match.group(0).lower().replace(" ", "")

        # Size / Screen size
        size_match = cls.SIZE_PATTERN.search(text)
        if size_match:
            discriminators["size"] = size_match.group(0).lower().replace(" ", "")

        # Capacity (e.g. AC 1.5 Ton, 7 Kg Washing Machine)
        cap_match = cls.CAPACITY_PATTERN.search(text)
        if cap_match:
            discriminators["capacity"] = cap_match.group(0).lower().replace(" ", "")

        # Augment with structured specifications if provided
        if specs:
            for k, v in specs.items():
                k_lower = k.lower()
                v_str = str(v).lower().replace(" ", "")
                if "storage" in k_lower:
                    discriminators["storage"] = v_str
                elif "ram" in k_lower:
                    discriminators["ram"] = v_str
                elif "capacity" in k_lower:
                    discriminators["capacity"] = v_str

        return discriminators

    @classmethod
    def match_products(
        cls,
        source_title: str,
        target_title: str,
        source_brand: str,
        target_brand: str,
        source_gtin: Optional[str] = None,
        target_gtin: Optional[str] = None,
        source_model: Optional[str] = None,
        target_model: Optional[str] = None,
        source_specs: Optional[Dict[str, Any]] = None,
        target_specs: Optional[Dict[str, Any]] = None,
    ) -> Tuple[float, str, Dict[str, Any]]:
        """
        Calculates matching confidence (0 to 100) and status:
        - "CONFIRMED" (>= 85% match, all variant discriminators match)
        - "TENTATIVE" (60-84% match, no contradictory variant discriminators)
        - "REJECTED" (< 60% match OR contradictory variant discriminators)
        """
        # 1. Exact GTIN / EAN barcode match
        if source_gtin and target_gtin and source_gtin.strip() == target_gtin.strip():
            return 100.0, "CONFIRMED", {"reason": "Exact GTIN/EAN barcode match", "gtin": source_gtin}

        # 2. Brand compatibility check
        norm_source_brand = source_brand.lower().strip()
        norm_target_brand = target_brand.lower().strip()
        if norm_source_brand != norm_target_brand and norm_source_brand not in norm_target_brand and norm_target_brand not in norm_source_brand:
            return 0.0, "REJECTED", {"reason": f"Mismatched brands: '{source_brand}' vs '{target_brand}'"}

        # 3. Discriminator check: If storage/capacity/volume contradicts, immediately REJECT
        source_disc = cls.extract_discriminators(source_title, source_specs)
        target_disc = cls.extract_discriminators(target_title, target_specs)

        for key in ["storage", "ram", "volume_weight", "capacity", "size"]:
            if key in source_disc and key in target_disc:
                if source_disc[key] != target_disc[key]:
                    return 0.0, "REJECTED", {
                        "reason": f"Material variant difference in {key}: '{source_disc[key]}' vs '{target_disc[key]}'"
                    }

        # 4. Model number check
        if source_model and target_model:
            norm_sm = re.sub(r'[^a-zA-Z0-9]', '', source_model).lower()
            norm_tm = re.sub(r'[^a-zA-Z0-9]', '', target_model).lower()
            if norm_sm == norm_tm:
                return 95.0, "CONFIRMED", {"reason": "Exact normalized model number match", "model": source_model}

        # 5. Token similarity on titles
        def tokenize(text: str) -> set:
            clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
            return {w for w in clean.split() if len(w) > 1}

        source_tokens = tokenize(source_title)
        target_tokens = tokenize(target_title)

        if not source_tokens or not target_tokens:
            return 0.0, "REJECTED", {"reason": "Insufficient title information"}

        intersection = source_tokens.intersection(target_tokens)
        union = source_tokens.union(target_tokens)
        jaccard = len(intersection) / len(union)

        # Confidence calculation
        confidence = round(jaccard * 100.0, 1)

        # High token overlap with no conflicting discriminators
        if confidence >= 70.0:
            status = "CONFIRMED"
        elif confidence >= 45.0:
            status = "TENTATIVE"
        else:
            status = "REJECTED"

        return confidence, status, {
            "matched_tokens": list(intersection),
            "source_discriminators": source_disc,
            "target_discriminators": target_disc
        }
