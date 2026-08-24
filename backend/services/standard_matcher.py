import re
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class StandardMatcherService:
    # Regex automata pattern for Indian Standards (IS)
    IS_REGEX = re.compile(
        r'\bIS\s*[:/-]?\s*(\d{3,5})\s*(?:\(\s*Part\s*(\d+)\s*\)|\(P[- ]?(\d+)\)|Part\s*(\d+))?\s*(?:[:/-]?\s*(\d{4}))?\b',
        re.IGNORECASE
    )

    PRODUCT_KEYWORDS = {
        "Toys & Child Safety": ["swing", "swings", "slides", "slide", "activity toy", "toy", "toys", "playground equipment", "play equipment"],
        "Construction & Structural": ["tmt", "rebar", "steel bar", "rebars", "concrete", "cement", "opc", "structural steel", "fe 500d", "fe 415", "i-beam", "angle", "channel"],
        "Safety & PPE": ["safety helmet", "hard hat", "respirator", "n95", "ffp2", "ffp1", "safety shoes", "safety boots", "steel toe"],
        "Electrical & Cables": ["pvc wire", "cable", "cables", "house wire", "xlpe", "power cable", "copper conductor", "aluminium conductor", "1100v", "11kv", "33kv"],
        "Fire Safety": ["fire extinguisher", "extinguishers", "dry chemical powder", "abc dry powder", "co2 extinguisher", "firefighting"],
        "Pipes & Infrastructure": ["hdpe pipe", "pe 100", "pe 80", "gi pipe", "steel tube", "galvanized pipe", "water supply pipe", "potable water"],
        "Renewable Energy & Solar": ["solar panel", "pv module", "photovoltaic", "solar cell", "solar power"],
        "Electrical & Lighting": ["led bulb", "led lamp", "led light", "lighting", "self-ballasted"],
        "Medical & Healthcare": ["surgical mask", "medical mask", "3 ply mask", "surgical gloves", "latex gloves", "sterile gloves"],
        "Electrical & Infrastructure": ["earthing", "earth pit", "grounding", "earthing electrode", "chemical earthing"]
    }

    GRADE_PATTERNS = [
        re.compile(r'\b(Fe\s*500D|Fe\s*500|Fe\s*415D|Fe\s*415|Fe\s*550D|Fe\s*550|Fe\s*600)\b', re.IGNORECASE),
        re.compile(r'\b(OPC\s*43|OPC\s*53|43\s*Grade|53\s*Grade|33\s*Grade)\b', re.IGNORECASE),
        re.compile(r'\b(E\s*250|E\s*350|E\s*410|Fe\s*410\s*W|Fe\s*490\s*W)\b', re.IGNORECASE),
        re.compile(r'\b(PE\s*100|PE\s*80|PE\s*63)\b', re.IGNORECASE),
        re.compile(r'\b(FFP1|FFP2|FFP3|N95)\b', re.IGNORECASE),
        re.compile(r'\b(Class\s*[ABC]|Type\s*IIR?)\b', re.IGNORECASE)
    ]

    MATERIAL_PATTERNS = [
        re.compile(r'\b(Thermo-Mechanically Treated|TMT|Deformed Carbon Steel|High Strength Steel|Mild Steel)\b', re.IGNORECASE),
        re.compile(r'\b(Ordinary Portland Cement|Portland Pozzolana Cement)\b', re.IGNORECASE),
        re.compile(r'\b(High Density Polyethylene|HDPE|PVC|Polyvinyl Chloride|XLPE|Cross-linked Polyethylene)\b', re.IGNORECASE),
        re.compile(r'\b(Electrolytic Copper|Aluminium Conductor)\b', re.IGNORECASE),
        re.compile(r'\b(Mono Ammonium Phosphate|Dry Chemical Powder)\b', re.IGNORECASE),
        re.compile(r'\b(Natural Rubber Latex|Nitrile)\b', re.IGNORECASE)
    ]

    TESTING_KEYWORDS = [
        "Tensile Test", "Proof Stress", "Elongation Test", "Bend Test", "Rebend Test",
        "Head Entrapment Probe Test", "Stability Test", "Small Parts Cylinder",
        "Shock Absorption Test", "Penetration Resistance", "Electrical Proof Test",
        "Hydrostatic Burst Pressure Test", "Carbon Black Dispersion",
        "Bacterial Filtration Efficiency (BFE)", "Water Leak Test", "Flame Retardant Test"
    ]

    @classmethod
    def extract_is_references(cls, text: str) -> List[Dict[str, Any]]:
        """
        Extracts all referenced IS standards with raw text and normalized strings.
        """
        matches = []
        seen = set()

        for match in cls.IS_REGEX.finditer(text):
            raw = match.group(0).strip()
            base_num = match.group(1)
            part_num = match.group(2) or match.group(3) or match.group(4)
            year = match.group(5)

            # Build canonical string
            parts = [f"IS {base_num}"]
            if part_num:
                parts.append(f"(Part {part_num})")
            if year:
                parts.append(f": {year}")
            
            canonical = " ".join(parts).replace(" :", ":")

            if canonical not in seen:
                seen.add(canonical)
                matches.append({
                    "raw_match": raw,
                    "normalized_is": canonical,
                    "base_number": f"IS {base_num}",
                    "part_number": int(part_num) if part_num else None,
                    "year": int(year) if year else None
                })
        return matches

    @classmethod
    def extract_specifications(cls, text: str, category_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts structured product specifications from unstructured tender clauses.
        """
        text_lower = text.lower()

        # 1. Detect Category
        detected_category = category_hint if (category_hint and category_hint != "all") else None
        if not detected_category:
            cat_scores = {}
            for cat, kws in cls.PRODUCT_KEYWORDS.items():
                score = sum(1 for kw in kws if kw in text_lower)
                if score > 0:
                    cat_scores[cat] = score
            if cat_scores:
                detected_category = max(cat_scores, key=cat_scores.get)
            else:
                detected_category = "General Public Procurement"

        # 2. Detect Product Name
        detected_product = None
        for cat, kws in cls.PRODUCT_KEYWORDS.items():
            for kw in kws:
                if kw in text_lower:
                    detected_product = kw.title()
                    break
            if detected_product:
                break
        if not detected_product:
            detected_product = "Procurement Item / Equipment"

        # 3. Detect Grade
        detected_grade = None
        for pat in cls.GRADE_PATTERNS:
            m = pat.search(text)
            if m:
                detected_grade = m.group(1)
                break

        # 4. Detect Material
        detected_material = None
        for pat in cls.MATERIAL_PATTERNS:
            m = pat.search(text)
            if m:
                detected_material = m.group(1)
                break

        # 5. Extract Dimensions
        dim_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:mm|cm|meters|sq\s*mm|Metric\s*Tonnes|kg|litres|kV|PN\s*\d+))\b', text, re.IGNORECASE)
        detected_dim = dim_match.group(1) if dim_match else None

        # 6. Testing Requirements
        detected_tests = []
        for tkw in cls.TESTING_KEYWORDS:
            if re.search(re.escape(tkw[:8]), text, re.IGNORECASE):
                detected_tests.append(tkw)

        return {
            "detected_product": detected_product,
            "category": detected_category,
            "grade": detected_grade,
            "material": detected_material,
            "dimensions": detected_dim,
            "testing_requirements": detected_tests
        }

    @classmethod
    def compute_semantic_similarity(cls, tender_text: str, candidate_standards: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], float]]:
        """
        Computes TF-IDF vector cosine similarity between tender text and standard scopes/keywords.
        """
        if not candidate_standards:
            return []

        corpus = [tender_text]
        for std in candidate_standards:
            doc_str = f"{std.get('title', '')} {std.get('scope', '')} {' '.join(std.get('keywords', []))} {' '.join(std.get('applicable_products', []))}"
            corpus.append(doc_str)

        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

            results = []
            for i, std in enumerate(candidate_standards):
                results.append((std, float(sim_scores[i])))
            return results
        except Exception:
            return [(std, 0.5) for std in candidate_standards]
