"""
Self-contained Python Test Runner (Standard Library)
"""

import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.services.standards_service import standards_service
from backend.services.entity_extractor import entity_extractor
from backend.services.recommender import recommendation_engine


def run_all_tests():
    print("==================================================")
    print("Running IS Standard Advisor Backend Verification Tests")
    print("==================================================")
    
    # Test 1: Standards Dataset Loading
    standards = standards_service.get_all()
    print(f"Test 1: Dataset loaded successfully -> {len(standards)} standards found.")
    assert len(standards) >= 10, "Dataset must have >= 10 standards"
    
    # Test 2: IS 1786 exists
    is1786 = standards_service.find_by_is_number("IS 1786:2008")
    assert is1786 is not None, "IS 1786:2008 not found"
    print("Test 2: IS 1786:2008 verified in dataset (Status: Current).")
    
    # Test 3: Regex Extraction & Outdated Revision Detection
    sample_text = "Procurement of swings conforming to IS 9873(P-4):2017 for children parks."
    refs = entity_extractor.extract_is_references(sample_text)
    assert len(refs) >= 1, "Failed to extract IS reference"
    assert refs[0].discrepancy_type == "OUTDATED_REVISION", f"Expected OUTDATED_REVISION, got {refs[0].discrepancy_type}"
    print(f"Test 3: Extracted reference '{refs[0].normalized_is}' correctly flagged as {refs[0].discrepancy_type}.")
    
    # Test 4: Recommendation Engine Upgrade
    specs = entity_extractor.extract_specifications(sample_text)
    primary_rec, alternatives, diff_comp, status, conf = recommendation_engine.recommend(
        text=sample_text,
        specs=specs,
        detected_refs=refs
    )
    assert primary_rec is not None, "Primary recommendation is None"
    assert "9873" in primary_rec.is_number and "2019" in primary_rec.is_number, f"Expected 2019 edition, got {primary_rec.is_number}"
    assert status == "OUTDATED_REFERENCE"
    assert conf >= 0.90
    print(f"Test 4: Recommendation engine successfully upgraded to '{primary_rec.is_number}' with {int(conf*100)}% confidence.")
    
    # Test 5: Steel TMT Rebars
    steel_text = "TMT deformed steel bars Fe 500D grade conforming to IS 1786:2008 with min 16% elongation."
    steel_refs = entity_extractor.extract_is_references(steel_text)
    steel_specs = entity_extractor.extract_specifications(steel_text)
    rec, _, _, steel_status, steel_conf = recommendation_engine.recommend(
        text=steel_text,
        specs=steel_specs,
        detected_refs=steel_refs
    )
    assert rec.is_number == "IS 1786:2008"
    assert steel_status == "VALID"
    assert steel_specs.grade == "Fe 500D"
    print(f"Test 5: Valid steel rebar tender verified: '{rec.is_number}' (Status: {steel_status}, Confidence: {int(steel_conf*100)}%).")
    
    print("\n==================================================")
    print("ALL BACKEND VERIFICATION TESTS PASSED (5/5)!")
    print("==================================================")


if __name__ == "__main__":
    run_all_tests()
