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
        # Matches CSV category: "Cement & Concrete"
        "Cement & Concrete": [
            "cement", "opc", "ordinary portland cement", "portland pozzolana cement",
            "ppc", "concrete", "rcc", "reinforced concrete", "mortar", "slag cement",
            "fly ash cement", "low heat cement", "sulphate resisting cement",
            "rapid hardening cement", "white cement", "composite cement", "hydraulic cement"
        ],
        # Matches CSV category: "Steel & Metal Products"
        "Steel & Metal Products": [
            "tmt", "rebar", "rebars", "steel bar", "steel bars", "structural steel",
            "fe 500d", "fe 415", "fe 500", "fe 550", "i-beam", "angle", "channel",
            "steel plate", "steel section", "hollow section", "steel tube", "steel pipe",
            "stainless steel", "aluminium", "gray iron", "cast iron", "rivet bar",
            "chequered plate", "mild steel", "high tensile steel"
        ],
        # Matches CSV category: "Water Supply & Pipes"
        "Water Supply & Pipes": [
            "gi pipe", "galvanized pipe", "water pipe", "water supply pipe",
            "precast concrete pipe", "ductile iron pipe", "cast iron pipe",
            "steel pipe water", "sluice valve", "butterfly valve", "pipe fitting",
            "malleable cast iron fitting", "water distribution"
        ],
        # Matches CSV category: "Electrical & Wiring"
        "Electrical & Wiring": [
            "pvc wire", "cable", "cables", "house wire", "xlpe", "power cable",
            "copper conductor", "aluminium conductor", "1100v", "11kv", "33kv",
            "earthing", "earth pit", "grounding", "mcb", "miniature circuit breaker",
            "electrical switch", "wiring installation", "electrical wiring"
        ],
        # Matches CSV category: "Safety Equipment"
        "Safety Equipment": [
            "safety helmet", "hard hat", "industrial helmet", "fire extinguisher",
            "extinguishers", "dry chemical powder", "abc dry powder", "co2 extinguisher",
            "firefighting", "safety footwear", "safety shoes", "safety boots",
            "eye protector", "rubber gloves electrical", "ppe", "protective equipment"
        ],
        # Matches CSV category: "Plastic Products"
        "Plastic Products": [
            "hdpe pipe", "pe 100", "pe 80", "pe 63", "upvc pipe", "pvc pipe",
            "polyethylene pipe", "polypropylene", "pet container", "plastic pipe",
            "plastic product", "food contact plastic", "packaged water bottle"
        ],
        # Matches CSV category: "Bricks & Clay Products"
        "Bricks & Clay Products": [
            "brick", "bricks", "clay brick", "building brick", "hollow brick",
            "fly ash brick", "concrete block", "masonry block", "lightweight block",
            "perforated brick", "lime block", "burnt clay"
        ],
        # Matches CSV category: "Timber & Wood Products"
        "Timber & Wood Products": [
            "timber", "wood", "plywood", "block board", "particle board",
            "flush door", "wooden door", "structural timber", "veneered board",
            "marine plywood", "shuttering plywood", "wood preservation"
        ],
        # Matches CSV category: "Paints & Coatings"
        "Paints & Coatings": [
            "paint", "enamel paint", "emulsion paint", "primer", "priming paint",
            "distemper", "varnish", "bituminous paint", "red oxide primer",
            "exterior enamel", "interior enamel", "coating"
        ],
        # Matches CSV category: "Aggregates & Sand"
        "Aggregates & Sand": [
            "aggregate", "coarse aggregate", "fine aggregate", "sand", "crushed stone",
            "gravel", "masonry mortar sand", "plaster sand", "sieve analysis"
        ],
        # Matches CSV category: "Adhesives"
        "Adhesives": [
            "adhesive", "resin adhesive", "wood adhesive", "pvac adhesive",
            "phenolic adhesive", "synthetic resin", "glue", "bonding"
        ],
        # Matches CSV category: "Furniture"
        "Furniture": [
            "furniture", "chair", "table", "school furniture", "library furniture",
            "work chair", "wooden furniture", "office chair", "classroom furniture"
        ],
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
        PRODUCT_DISPLAY_NAMES = {
            "tmt": "TMT Rebars", "rebar": "Steel Rebar", "rebars": "Steel Rebars",
            "cement": "OPC Cement", "opc": "OPC Cement", "concrete": "Concrete",
            "structural steel": "Structural Steel",
            "swing": "Children Swings", "swings": "Children Swings",
            "slide": "Activity Slide", "slides": "Activity Slides",
            "activity toy": "Activity Toys", "toy": "Toys", "toys": "Toys",
            "playground equipment": "Playground Equipment",
            "safety helmet": "Industrial Safety Helmet", "hard hat": "Industrial Safety Helmet",
            "respirator": "Respirator / N95 Mask", "n95": "N95 Respirator",
            "safety shoes": "Safety Footwear", "safety boots": "Safety Boots",
            "pvc wire": "PVC Insulated Wire", "cable": "PVC Cable", "cables": "PVC Cables",
            "house wire": "PVC House Wire", "xlpe": "XLPE Power Cable",
            "fire extinguisher": "ABC Fire Extinguisher", "extinguishers": "Fire Extinguishers",
            "hdpe pipe": "HDPE Water Pipe", "gi pipe": "GI Steel Pipe",
            "solar panel": "Solar PV Module", "pv module": "Solar PV Module",
            "led bulb": "LED Lamp", "led lamp": "LED Lamp",
            "surgical mask": "Surgical Face Mask", "surgical gloves": "Surgical Gloves",
            "earthing": "Earthing System", "earth pit": "Earth Pit Electrode",
        }
        detected_product = None
        for cat, kws in cls.PRODUCT_KEYWORDS.items():
            for kw in kws:
                if kw in text_lower:
                    detected_product = PRODUCT_DISPLAY_NAMES.get(kw, kw.title())
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
