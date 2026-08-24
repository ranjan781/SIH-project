"""
csv_catalog_service.py
======================
Wraps the pre-built TF-IDF vector store (bis_tfidf.pkl) and BIS metadata
(bis_metadata.json) built from bis_standards_dataset_expanded.csv.

Provides:
  - similarity_search(query, n, category)  → top-N matched standards
  - lookup_by_is_number(is_str)            → exact or fuzzy IS number lookup
  - get_all_records()                      → all 131 CSV records as dicts
  - get_catalog_stats()                    → category breakdown, total count
  - find_status(is_number, revision_svc)   → Current/Superseded/Withdrawn via standards.json
"""

import os
import re
import json
from typing import List, Dict, Any, Optional

# ── Paths ────────────────────────────────────────────────────────────────────
_HERE         = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DATA_DIR     = os.path.join(_HERE, "data")
_METADATA_PATH = os.path.join(_DATA_DIR, "bis_metadata.json")
_INDEX_PATH    = os.path.join(_DATA_DIR, "bis_tfidf.pkl")
_CSV_PATH      = os.path.join(_DATA_DIR, "bis_standards_dataset_expanded (1).csv")

# Lazy singletons
_metadata: Optional[List[Dict]] = None
_vectorizer = None
_matrix = None


def _load_index():
    """Lazy-load the TF-IDF index and metadata."""
    global _vectorizer, _matrix, _metadata

    if _metadata is not None:
        return _vectorizer, _matrix, _metadata

    # Load metadata
    if os.path.exists(_METADATA_PATH):
        with open(_METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    else:
        # Build from CSV if metadata missing
        _build_from_csv()
        return _load_index()

    # Load TF-IDF index
    if os.path.exists(_INDEX_PATH):
        import pickle
        with open(_INDEX_PATH, "rb") as f:
            saved = pickle.load(f)
        _vectorizer = saved["vectorizer"]
        _matrix = saved["matrix"]
    else:
        _build_from_csv()
        return _load_index()

    return _vectorizer, _matrix, _metadata


def _build_from_csv():
    """Rebuild index from CSV (fallback if pkl missing)."""
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    import pickle

    csv_path = _CSV_PATH
    if not os.path.exists(csv_path):
        # try raw data path
        root = os.path.dirname(_HERE)
        csv_path = os.path.join(root, "data", "raw", "data", "bis_standards_dataset_expanded.csv")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"BIS CSV dataset not found. Checked: {_CSV_PATH} and {csv_path}")

    df = pd.read_csv(csv_path)
    df.fillna("", inplace=True)

    docs, metas = [], []
    for _, row in df.iterrows():
        is_num = str(row.get("IS_number", ""))
        title = str(row.get("title", ""))
        category = str(row.get("category", ""))
        scope = str(row.get("scope_description", ""))
        refs = str(row.get("normative_refs", ""))
        version = str(row.get("latest_version", ""))
        cert = str(row.get("certification_required", ""))

        doc = f"{is_num} {is_num} {title} {title} {category} {scope} References: {refs} Version: {version} Cert: {cert}"
        docs.append(doc)
        metas.append({
            "IS_number": is_num,
            "title": title,
            "category": category,
            "latest_version": version,
            "amendment": str(row.get("amendment", "")),
            "normative_refs": refs,
            "certification_required": cert,
            "scope_description": scope,
            "document_text": doc,
        })

    vectorizer = TfidfVectorizer(
        analyzer="word", ngram_range=(1, 2), min_df=1, max_df=0.95,
        sublinear_tf=True, token_pattern=r"(?u)\b[\w\.]+\b"
    )
    matrix = vectorizer.fit_transform(docs)

    with open(_INDEX_PATH, "wb") as f:
        pickle.dump({"vectorizer": vectorizer, "matrix": matrix}, f, protocol=4)
    with open(_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metas, f, ensure_ascii=False, indent=2)

    global _vectorizer, _matrix, _metadata
    _vectorizer, _matrix, _metadata = vectorizer, matrix, metas


def _normalize_is(is_str: str) -> str:
    """Normalize IS number for comparison: uppercase, strip spaces/colons/hyphens."""
    s = is_str.upper()
    s = re.sub(r"[\s:\-\(\)]", "", s)
    s = s.replace("PART", "P")
    return s


def similarity_search(
    query: str,
    n_results: int = 10,
    category_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Semantic (TF-IDF cosine) search over the full 131-standard BIS dataset.

    Args:
        query          : Free-text query — tender excerpt, IS number, product keyword
        n_results      : Max results to return
        category_filter: Optional exact CSV category string to restrict results
                         e.g. "Cement & Concrete", "Steel & Metal Products"

    Returns:
        List of dicts with IS_number, title, category, scope_description,
        latest_version, amendment, normative_refs, certification_required,
        similarity_score
    """
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity as cos_sim

    vec, mat, meta = _load_index()
    if vec is None or mat is None:
        return []

    q_vec = vec.transform([query])
    scores = cos_sim(q_vec, mat).flatten()
    ranked = scores.argsort()[::-1]

    results = []
    for i in ranked:
        if len(results) >= n_results * 3:   # over-fetch for category filtering
            break
        record = dict(meta[i])
        record["similarity_score"] = round(float(scores[i]), 4)
        if category_filter:
            if record.get("category", "").strip().lower() != category_filter.strip().lower():
                continue
        results.append(record)
        if len(results) >= n_results:
            break

    return results


def lookup_by_is_number(is_str: str) -> Optional[Dict[str, Any]]:
    """
    Direct IS number lookup in the CSV metadata.
    Handles variants: "IS 1786:2008", "IS1786", "IS 1786 2008", etc.
    """
    _, __, meta = _load_index()
    if not meta:
        return None

    norm_query = _normalize_is(is_str)

    # Exact normalized match first
    for rec in meta:
        if _normalize_is(rec.get("IS_number", "")) == norm_query:
            return rec

    # Partial / prefix match (base IS number without year)
    base = re.sub(r"\d{4}$", "", norm_query).rstrip(":")
    for rec in meta:
        norm_rec = _normalize_is(rec.get("IS_number", ""))
        if norm_rec.startswith(base) and base:
            return rec

    return None


def get_all_records() -> List[Dict[str, Any]]:
    """Return all 131 CSV records."""
    _, __, meta = _load_index()
    return meta or []


def get_catalog_stats() -> Dict[str, Any]:
    """Return count and category breakdown of the full CSV dataset."""
    _, __, meta = _load_index()
    if not meta:
        return {"total_standards": 0, "category_distribution": {}}

    cats: Dict[str, int] = {}
    cert_count = 0
    for rec in meta:
        c = rec.get("category", "General")
        cats[c] = cats.get(c, 0) + 1
        cert_val = rec.get("certification_required", "")
        if cert_val.lower().startswith("yes"):
            cert_count += 1

    return {
        "total_standards": len(meta),
        "isi_certified_standards": cert_count,
        "category_distribution": cats,
        "categories": sorted(cats.keys()),
        "data_source": "bis_standards_dataset_expanded.csv"
    }


def enrich_with_status(records: List[Dict[str, Any]], revision_service) -> List[Dict[str, Any]]:
    """
    Enrich CSV records with Superseded/Withdrawn/Current status
    using standards.json revision data as source of truth.

    Args:
        records         : CSV records from similarity_search()
        revision_service: RevisionCheckerService instance

    Returns:
        Same list with added 'status', 'superseded_by', 'replaces', 'mandatory_qco' fields
    """
    enriched = []
    for rec in records:
        is_num = rec.get("IS_number", "")
        # Look up status from standards.json revision graph
        std_record = revision_service.find_standard_by_is_number(is_num)
        if std_record:
            rec["status"] = std_record.get("status", "Current")
            rec["superseded_by"] = std_record.get("superseded_by")
            rec["replaces"] = std_record.get("replaces")
            rec["mandatory_qco"] = std_record.get("mandatory_qco", rec.get("certification_required", ""))
        else:
            # Derive status heuristically from amendment/version text
            amendment_text = rec.get("amendment", "").lower()
            if "reaffirmed" in amendment_text or rec.get("latest_version", ""):
                rec["status"] = "Current"
            else:
                rec["status"] = "Current"
            rec["superseded_by"] = None
            rec["replaces"] = None
            rec["mandatory_qco"] = rec.get("certification_required", "")

        enriched.append(rec)
    return enriched
