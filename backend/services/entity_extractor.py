"""
NLP & Rule-based Entity & Technical Specification Extractor
Identifies Indian Standards (IS), Product Categories, Materials, Grades, Dimensions, and Testing Criteria.
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from backend.models.schemas import ExtractedSpecifications, DetectedStandardReference
from backend.services.standards_service import standards_service


class EntityExtractor:
    # Regex for various Indian Standard notation variants
    # Examples: IS 1786:2008, IS:456-2000, IS 9873(Part 4):2019, IS 9873(P-4):2017, IS 1239 (Part 1), IS 694
    IS_REGEX = re.compile(
        r'\b(?:IS|I\.S\.|INDIAN\s+STANDARD)\s*:?\s*(\d{2,5})(?:\s*[\(\[]?\s*(?:Part|Pt|P)\s*[-:]?\s*(\d+)[\)\]]?)?(?:\s*[:\-\/]\s*(\d{4}))?\b',
        re.IGNORECASE
    )

    PRODUCT_RULES = [
        # (Keywords, Product Name, Category)
        (["tmt", "rebar", "reinforcement steel", "fe 500", "fe 415", "fe 550", "deformed steel bar"], "TMT Reinforcement Steel Bars", "Construction & Structural"),
        (["opc 43", "43 grade cement", "ordinary portland cement", "opc cement", "hydraulic cement"], "Ordinary Portland Cement (43 Grade)", "Construction & Structural"),
        (["opc 53", "53 grade cement", "high strength cement"], "Ordinary Portland Cement (53 Grade)", "Construction & Structural"),
        (["concrete", "rcc", "plain concrete", "mix design m25", "m30 concrete"], "Plain and Reinforced Concrete (RCC)", "Construction & Structural"),
        (["structural steel", "i-beam", "steel angles", "steel channel", "e250", "e350", "ms plate"], "Hot Rolled Structural Steel", "Construction & Structural"),
        (["swings", "slides", "activity toy", "playground equipment", "domestic play", "climbing frame"], "Children Playground Activity Toys (Swings/Slides)", "Toys & Child Safety"),
        (["toy", "doll", "action figure", "plush toy", "small parts choking"], "Children General Safety Toys", "Toys & Child Safety"),
        (["safety helmet", "industrial helmet", "hard hat", "head protection"], "Industrial Safety Helmets (HDPE)", "Safety & PPE"),
        (["respirator", "n95", "ffp2", "half mask", "particulate mask", "dust mask"], "Filtering Half Mask Respirator (N95 / FFP2)", "Safety & PPE"),
        (["safety shoe", "steel toe", "safety boots", "work boot"], "Industrial Safety Footwear (Steel Toe)", "Safety & PPE"),
        (["pvc insulated", "house wire", "copper wire", "building wire", "fr wire", "frls wire"], "PVC Insulated Copper House Wiring Cables", "Electrical & Cables"),
        (["xlpe", "armoured cable", "lt cable", "1.1 kv cable", "power cable", "underground cable"], "XLPE Insulated LT Power Cables (1.1 kV)", "Electrical & Cables"),
        (["ht cable", "11kv cable", "33kv cable", "medium voltage cable"], "XLPE Insulated HT Power Cables (11kV - 33kV)", "Electrical & Cables"),
        (["fire extinguisher", "abc powder", "stored pressure", "dry chemical powder", "co2 extinguisher"], "Portable ABC Dry Powder Fire Extinguishers", "Fire Safety"),
        (["hdpe pipe", "pe 100", "pe 80", "water supply pipe", "potable water pipe", "jal jeevan"], "HDPE Potable Water Pipes (PE 100/PE 80)", "Pipes & Infrastructure"),
        (["gi pipe", "steel tube", "galvanized pipe", "erw pipe", "mild steel pipe", "tubular"], "Galvanized Mild Steel Tubes / GI Pipes", "Pipes & Infrastructure"),
        (["solar panel", "pv module", "photovoltaic", "crystalline silicon", "solar module"], "Crystalline Silicon Terrestrial Solar PV Modules", "Renewable Energy & Solar"),
        (["led lamp", "led bulb", "b22 led", "e27 led", "self-ballasted"], "Self-Ballasted LED Lamps", "Electrical & Lighting"),
        (["surgical mask", "3 ply mask", "medical face mask", "bfe 98%"], "3-Ply Surgical Medical Face Masks", "Medical & Healthcare"),
        (["surgical gloves", "latex gloves", "sterile gloves", "medical gloves"], "Surgical Rubber Examination Gloves", "Medical & Healthcare"),
        (["earthing", "earth pit", "chemical earthing", "earthing electrode", "grounding rod"], "Earthing System & Maintenance-Free Electrodes", "Electrical & Infrastructure"),
    ]

    GRADE_PATTERNS = [
        r'\b(Fe\s*415D?|Fe\s*500D?|Fe\s*550D?|Fe\s*600)\b',
        r'\b(OPC\s*43|OPC\s*53|43\s*Grade|53\s*Grade|PPC)\b',
        r'\b(E\s*250|E\s*275|E\s*300|E\s*350|E\s*410)\b',
        r'\b(PE\s*63|PE\s*80|PE\s*100)\b',
        r'\b(PN\s*2\.5|PN\s*4|PN\s*6|PN\s*10|PN\s*12\.5|PN\s*16)\b',
        r'\b(Class\s*[A-C]|Class\s*1|Class\s*2|Class\s*5)\b',
        r'\b(FFP1|FFP2|FFP3|Type\s*I|Type\s*II|Type\s*IIR)\b',
        r'\b(M15|M20|M25|M30|M35|M40)\b'
    ]

    MATERIAL_PATTERNS = [
        r'\b(Thermo-Mechanically\s+Treated|TMT|High\s+Yield\s+Strength\s+Deformed|Carbon\s+Steel)\b',
        r'\b(High\s+Density\s+Polyethylene|HDPE|Low\s+Density\s+Polyethylene|LDPE)\b',
        r'\b(Polyvinyl\s+Chloride|PVC|Cross-linked\s+Polyethylene|XLPE)\b',
        r'\b(Electrolytic\s+Copper|Bright\s+Annealed\s+Copper|Aluminium|Galvanized\s+Iron|GI|Mild\s+Steel|MS)\b',
        r'\b(Latex|Rubber|Nitrile|Non-woven\s+Polypropylene)\b',
        r'\b(Ordinary\s+Portland\s+Cement|Hydraulic\s+Cement)\b'
    ]

    TESTING_KEYWORDS = [
        "tensile", "yield stress", "proof stress", "elongation", "bend test", "rebend test",
        "hydrostatic", "burst pressure", "spark test", "insulation resistance", "shock absorption",
        "impact test", "penetration test", "flammability", "flame retardant", "entrapment",
        "small parts", "drop test", "chemical analysis", "soundness", "setting time",
        "compressive strength", "bacterial filtration", "splash resistance", "charpy"
    ]

    @classmethod
    def extract_is_references(cls, text: str) -> List[DetectedStandardReference]:
        matches = cls.IS_REGEX.finditer(text)
        detected_refs: List[DetectedStandardReference] = []
        seen = set()

        for m in matches:
            raw_str = m.group(0).strip()
            num_part = m.group(1)
            part_sub = m.group(2)
            year_sub = m.group(3)

            base_is = f"IS {num_part}"
            if part_sub:
                base_is += f" (Part {part_sub})"

            cited_year = int(year_sub) if year_sub else None
            normalized_is = f"{base_is}: {cited_year}" if cited_year else base_is

            dedup_key = f"{base_is}_{cited_year}"
            if dedup_key in seen:
                continue
            seen.add(dedup_key)

            # Check against catalog
            exact_std = standards_service.find_by_is_number(normalized_is)
            latest_std = standards_service.get_latest_current_version(base_is)

            is_known = exact_std is not None or latest_std is not None
            dataset_status = exact_std.status if exact_std else ("Current" if latest_std else "Unknown")
            latest_year = latest_std.current_edition_year if latest_std else None
            superseded_by = exact_std.superseded_by if exact_std else None

            # Determine discrepancy type
            if exact_std and exact_std.status == "Current":
                discrepancy = "VALID_CURRENT"
                details = f"Verified: {normalized_is} is the active Indian Standard."
            elif exact_std and exact_std.status == "Superseded":
                discrepancy = "OUTDATED_REVISION"
                details = f"Outdated Reference: {normalized_is} was superseded by {exact_std.superseded_by or latest_std.is_number}."
            elif exact_std and exact_std.status == "Withdrawn":
                discrepancy = "WITHDRAWN_STANDARD"
                details = f"Withdrawn: {normalized_is} has been withdrawn by BIS. Current replacement: {exact_std.superseded_by or 'None'}."
            elif latest_std and cited_year and cited_year < latest_std.current_edition_year:
                discrepancy = "OUTDATED_REVISION"
                details = f"Potential Outdated Year: Referenced {cited_year}, latest active edition is {latest_std.is_number}."
            elif latest_std:
                discrepancy = "VALID_CURRENT"
                details = f"Aligned with active standard {latest_std.is_number}."
            else:
                discrepancy = "NOT_IN_RESEARCH_DATASET"
                details = f"Standard {normalized_is} detected in tender text, but detailed clause schema is not yet in the demo research dataset."

            detected_refs.append(DetectedStandardReference(
                raw_match=raw_str,
                normalized_is=normalized_is,
                base_number=base_is,
                cited_year=cited_year,
                is_known_in_dataset=is_known,
                dataset_status=dataset_status,
                latest_edition_year=latest_year,
                superseded_by=superseded_by,
                discrepancy_type=discrepancy,
                discrepancy_details=details
            ))

        return detected_refs

    @classmethod
    def extract_product_and_category(cls, text: str, hint: Optional[str] = None) -> Tuple[str, str]:
        text_lower = text.lower()

        # Score matching rules
        best_match = None
        highest_score = 0

        for keywords, product_name, category in cls.PRODUCT_RULES:
            score = 0
            for kw in keywords:
                if kw in text_lower:
                    score += 1
            if score > highest_score:
                highest_score = score
                best_match = (product_name, category)

        if best_match and highest_score > 0:
            return best_match

        # Fallback if hint provided
        if hint and hint.lower() != "all":
            return f"Procurement item in {hint}", hint

        return "Unspecified Industrial / Procurement Product", "General Engineering"

    @classmethod
    def extract_specifications(cls, text: str, hint: Optional[str] = None) -> ExtractedSpecifications:
        product_name, category = cls.extract_product_and_category(text, hint)

        # Extract Grades
        extracted_grades = []
        for pat in cls.GRADE_PATTERNS:
            found = re.findall(pat, text, re.IGNORECASE)
            for f in found:
                if f not in extracted_grades:
                    extracted_grades.append(f)

        # Extract Materials
        extracted_materials = []
        for pat in cls.MATERIAL_PATTERNS:
            found = re.findall(pat, text, re.IGNORECASE)
            for f in found:
                if f not in extracted_materials:
                    extracted_materials.append(f)

        # Extract Dimensions / Numerical specs (e.g. 12mm, 500 N/mm2, 240V, 6 kg, 15 bar)
        dim_patterns = [
            r'\b(\d+(?:\.\d+)?\s*(?:mm|cm|meter|m|sq\s*mm|sqmm|sq\.mm|kg|tonnes|MT|kV|V|kN|MPa|N\/mm2|bar|m2\/kg|Joules|liters|HP))\b'
        ]
        extracted_dims = []
        for pat in dim_patterns:
            found = re.findall(pat, text, re.IGNORECASE)
            for f in found[:6]:  # Limit top 6 dimensions
                if f not in extracted_dims:
                    extracted_dims.append(f)

        # Extract Testing Requirements
        text_lower = text.lower()
        extracted_tests = []
        for test_kw in cls.TESTING_KEYWORDS:
            if test_kw in text_lower:
                extracted_tests.append(f"{test_kw.title()} requirement")

        # Compile Key Parameters
        key_params = []
        if extracted_grades:
            key_params.append(f"Grade: {', '.join(extracted_grades[:3])}")
        if extracted_materials:
            key_params.append(f"Material: {', '.join(extracted_materials[:2])}")
        if extracted_dims:
            key_params.append(f"Dimensions/Ratings: {', '.join(extracted_dims[:4])}")
        if extracted_tests:
            key_params.append(f"Tests: {', '.join(extracted_tests[:4])}")

        raw_specs = {
            "grades_detected": extracted_grades,
            "materials_detected": extracted_materials,
            "dimensions_detected": extracted_dims,
            "tests_detected": extracted_tests
        }

        return ExtractedSpecifications(
            detected_product=product_name,
            category=category,
            grade=extracted_grades[0] if extracted_grades else None,
            material=extracted_materials[0] if extracted_materials else None,
            dimensions=", ".join(extracted_dims[:3]) if extracted_dims else None,
            testing_requirements=extracted_tests[:6],
            raw_specifications=raw_specs,
            key_parameters=key_params
        )


entity_extractor = EntityExtractor()
