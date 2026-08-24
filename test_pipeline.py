import json
import urllib.request

def run_tests():
    tenders = json.load(open('backend/data/tenders.json', encoding='utf-8'))
    standards = json.load(open('backend/data/standards.json', encoding='utf-8'))

    print('=' * 72)
    print('  LIVE API TEST: All 7 Tender Scenarios vs. IS Standard Advisor')
    print('=' * 72)

    pass_count = 0
    fail_count = 0
    results = []

    for t in tenders:
        payload = json.dumps({
            'text': t['text'],
            'tender_ref': t['tender_ref'],
            'issuing_authority': t['issuing_authority'],
            'document_name': t['id'] + '.txt'
        }).encode()
        req = urllib.request.Request(
            'http://localhost:5000/api/analyze-text',
            data=payload,
            headers={'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                r = json.loads(resp.read())

            exp_is = t['expected_detected_is']
            exp_rec = t['expected_recommended_is']
            got_prod = r.get('detected_product', '?')
            got_status = r.get('overall_status', '?')
            got_conf = r.get('overall_confidence', '?')
            prim = r.get('primary_recommendation', {})
            got_rec = prim.get('is_number', '?')

            # Check detected IS reference
            ref_stds = [x['normalized_is'] for x in r.get('referenced_standards', [])]
            detected_match = any(exp_is[:8] in rs for rs in ref_stds) if ref_stds else False
            rec_match = exp_rec[:8] in got_rec

            det_label = 'PASS' if detected_match else 'FAIL'
            rec_label = 'PASS' if rec_match else 'FAIL'
            if detected_match and rec_match:
                pass_count += 1
                overall = 'PASS'
            else:
                fail_count += 1
                overall = 'FAIL'

            print(f"\nTENDER: {t['id']}  [{overall}]")
            print(f"  Scenario       : {t['scenario_type']}")
            print(f"  Expected IS    : {exp_is}   ->  Got: {ref_stds}")
            print(f"  Detection      : [{det_label}]")
            print(f"  Expected Rec.  : {exp_rec}   ->  Got: {got_rec}")
            print(f"  Recommendation : [{rec_label}]")
            print(f"  Status/Confidence: {got_status} | {got_conf}")
            print(f"  Product Detected: {got_prod}")
            for ref in r.get('referenced_standards', []):
                disc = ref['discrepancy_type']
                detail = ref['discrepancy_details'][:90]
                print(f"  Discrepancy [{ref['normalized_is']}]: {disc}")
                print(f"    -> {detail}")
            
            results.append({
                'id': t['id'],
                'overall': overall,
                'detected_match': det_label,
                'rec_match': rec_label,
                'exp_is': exp_is,
                'got_is': ref_stds,
                'exp_rec': exp_rec,
                'got_rec': got_rec,
                'status': got_status,
                'confidence': got_conf,
                'xai_reasons': prim.get('why_recommended_reasons', []),
                'rejected_reasons': prim.get('why_rejected_reasons', []),
                'verdict': r.get('summary_verdict', '')
            })

        except Exception as e:
            print(f"\nTENDER: {t['id']} - ERROR: {e}")
            fail_count += 1
            results.append({'id': t['id'], 'overall': 'ERROR', 'error': str(e)})

    print()
    print('=' * 72)
    print(f"  SUMMARY: {pass_count}/{pass_count+fail_count} tests PASSED  |  {fail_count} FAILED")
    print('=' * 72)

    # XAI Details
    print("\n-- XAI Rationale Details (Primary Recommendation) --")
    for res in results:
        if res.get('overall') == 'PASS':
            print(f"\n[{res['id']}] Verdict: {res.get('verdict','')}")
            for i, r in enumerate(res.get('xai_reasons', []), 1):
                print(f"  Reason {i}: {r}")
            for i, r in enumerate(res.get('rejected_reasons', []), 1):
                print(f"  Rejection {i}: {r}")

    # Stats check
    print("\n-- Standards Dataset Stats --")
    req2 = urllib.request.Request('http://localhost:5000/api/catalog/stats')
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        stats = json.loads(resp2.read())
    print(f"  Total Standards   : {stats.get('total_standards')}")
    print(f"  Current           : {stats.get('current_standards')}")
    print(f"  Superseded        : {stats.get('superseded_standards')}")
    print(f"  Withdrawn         : {stats.get('withdrawn_standards')}")
    print(f"  Category Breakdown: {json.dumps(stats.get('category_distribution'), indent=4)}")

    return results

if __name__ == '__main__':
    run_tests()
