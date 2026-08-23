import os
import sys
import json
import unittest

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import create_app

class FlaskBackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_01_health_endpoint(self):
        """Verify GET /api/health returns 200 with Flask backend metadata"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "online")
        self.assertEqual(data.get("backend"), "Flask")
        self.assertEqual(data.get("project"), "SIH26108")
        print("[PASS] Test 1: GET /api/health returns Flask online status.")

    def test_02_standards_list_and_filter(self):
        """Verify GET /api/standards lists standards and supports filtering"""
        response = self.client.get('/api/standards')
        self.assertEqual(response.status_code, 200)
        standards = response.get_json()
        self.assertGreaterEqual(len(standards), 20)
        print(f"[PASS] Test 2: GET /api/standards returned {len(standards)} standards.")

        # Test search query
        res_search = self.client.get('/api/standards?search=1786')
        self.assertEqual(res_search.status_code, 200)
        search_data = res_search.get_json()
        self.assertTrue(any("1786" in s["is_number"] for s in search_data))
        print("[PASS] Test 2b: Standards search filter functional.")

    def test_03_analyze_text_outdated_revision(self):
        """Verify POST /api/analyze-text flags outdated IS 9873:2017 and recommends IS 9873:2019"""
        payload = {
            "text": "Sealed tenders for outdoor children swings conforming to IS 9873(P-4):2017 with head entrapment probe testing.",
            "category_hint": "Toys & Child Safety",
            "tender_ref": "DUD/PARKS/2024/SW-092"
        }
        response = self.client.post('/api/analyze-text', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        self.assertEqual(data.get("overall_status"), "OUTDATED_REFERENCE")
        self.assertEqual(data["primary_recommendation"]["is_number"], "IS 9873 (Part 4): 2019")
        self.assertGreaterEqual(data["overall_confidence"], 0.85)
        self.assertGreaterEqual(len(data["primary_recommendation"]["why_recommended_reasons"]), 2)
        print(f"[PASS] Test 3: Outdated IS 9873:2017 accurately upgraded to IS 9873:2019 (Confidence: {data['overall_confidence'] * 100}%).")

    def test_04_analyze_text_valid_steel_rebar(self):
        """Verify POST /api/analyze-text validates active IS 1786:2008 Fe 500D"""
        payload = {
            "text": "Supply of TMT reinforcement steel bars grade Fe 500D conforming to IS 1786:2008 with 16% elongation and 500 N/mm2 yield stress.",
            "category_hint": "Construction & Structural",
            "tender_ref": "PWD/BR/2024/TMT-410"
        }
        response = self.client.post('/api/analyze-text', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()

        self.assertEqual(data.get("overall_status"), "VALID")
        self.assertEqual(data["primary_recommendation"]["is_number"], "IS 1786:2008")
        self.assertGreaterEqual(data["overall_confidence"], 0.90)
        print(f"[PASS] Test 4: Valid steel rebar IS 1786:2008 confirmed as VALID (Confidence: {data['overall_confidence'] * 100}%).")

    def test_05_audit_decision_and_history(self):
        """Verify POST /api/audit-decision records officer signoff and GET /api/audit-history lists it"""
        decision_payload = {
            "analysis_id": "ANL-TEST001",
            "standard_id": "IS 1786:2008",
            "decision": "ACCEPTED",
            "officer_name": "Er. Sachin Gupta",
            "officer_role": "Chief Procurement Verification Officer",
            "remarks": "Approved Fe 500D compliance under mandatory Steel QCO."
        }
        post_res = self.client.post('/api/audit-decision', data=json.dumps(decision_payload), content_type='application/json')
        self.assertEqual(post_res.status_code, 200)
        entry = post_res.get_json()
        self.assertEqual(entry["decision"], "ACCEPTED")

        hist_res = self.client.get('/api/audit-history')
        self.assertEqual(hist_res.status_code, 200)
        logs = hist_res.get_json()
        self.assertTrue(any(l["analysis_id"] == "ANL-TEST001" for l in logs))
        print("[PASS] Test 5: Officer audit decision recorded and retrieved from audit history.")


if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("Running Flask Backend Verification Tests")
    print("=" * 55)
    unittest.main(verbosity=2)
