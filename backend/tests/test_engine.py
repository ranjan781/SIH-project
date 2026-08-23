"""
Unit & Integration Tests for IS Standard Advisor Backend
"""

import pytest
from backend.services.standards_service import standards_service
from backend.services.entity_extractor import entity_extractor
from backend.services.recommender import recommendation_engine


def test_standards_dataset_loaded():
    standards = standards_service.get_all()
    assert len(standards) >= 10
    
    # Check IS 1786 exists
    is1786 = standards_service.find_by_is_number("IS 1786:2008")
    assert is1786 is not None
    assert is1786.status == "Current"


def test_is_reference_regex_extraction():
    sample_text = "Supply of TMT steel conforming to IS 1786:2008 and safety toys as per IS 9873(P-4):2017."
    refs = entity_extractor.extract_is_references(sample_text)
    
    assert len(refs) >= 2
    is_numbers = [r.normalized_is for r in refs]
    assert "IS 1786: 2008" in is_numbers or "IS 1786:2008" in is_numbers
    
    # Check outdated detection for IS 9873(P-4):2017
    toy_ref = next((r for r in refs if "9873" in r.normalized_is), None)
    assert toy_ref is not None
    assert toy_ref.discrepancy_type == "OUTDATED_REVISION"


def test_outdated_revision_upgrade_recommendation():
    # Tender with outdated IS 9873(P-4):2017
    toy_tender_text = "Procurement of playground swings and slides conforming to IS 9873(P-4):2017 for children parks."
    refs = entity_extractor.extract_is_references(toy_tender_text)
    specs = entity_extractor.extract_specifications(toy_tender_text)
    
    primary_rec, alternatives, diff_comp, status, conf = recommendation_engine.recommend(
        text=toy_tender_text,
        specs=specs,
        detected_refs=refs
    )
    
    assert primary_rec is not None
    assert "9873" in primary_rec.is_number
    assert "2019" in primary_rec.is_number
    assert status == "OUTDATED_REFERENCE"
    assert conf >= 0.90
    assert diff_comp is not None


def test_steel_tmt_recommendation():
    steel_tender = "TMT deformed steel bars Fe 500D grade conforming to IS 1786:2008 with min 16% elongation and max 0.075% S+P."
    refs = entity_extractor.extract_is_references(steel_tender)
    specs = entity_extractor.extract_specifications(steel_tender)
    
    primary_rec, _, _, status, conf = recommendation_engine.recommend(
        text=steel_tender,
        specs=specs,
        detected_refs=refs
    )
    
    assert primary_rec is not None
    assert primary_rec.is_number == "IS 1786:2008"
    assert status == "VALID"
    assert conf >= 0.90
    assert specs.grade == "Fe 500D"
