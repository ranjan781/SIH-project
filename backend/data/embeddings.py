"""
embeddings.py  -  BIS Standards Vector DB
==========================================
Builds a TF-IDF + cosine-similarity vector store from the BIS standards CSV.
Uses scikit-learn (already installed) — no neural model or external API needed.

For 154 documents, TF-IDF achieves excellent recall and is instant to query.

Standalone:
    python backend/data/embeddings.py                    # build index
    python backend/data/embeddings.py --force            # rebuild
    python backend/data/embeddings.py --stats            # info
    python backend/data/embeddings.py --query "Fe 500 TMT steel"

Importable (Flask):
    from backend.data.embeddings import similarity_search, get_collection_stats, ingest
"""

import os, sys, json, re
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Paths ──────────────────────────────────────────────────────────────────
_HERE         = os.path.dirname(os.path.abspath(__file__))
CSV_PATH      = os.path.join(_HERE, "bis_standards_dataset_expanded (1).csv")
INDEX_PATH    = os.path.join(_HERE, "bis_tfidf.pkl")   # vectorizer + matrix
METADATA_PATH = os.path.join(_HERE, "bis_metadata.json")

# ── Singletons ─────────────────────────────────────────────────────────────
_vectorizer = None
_matrix     = None   # sparse TF-IDF matrix (n_docs × n_features)
_metadata   = None   # list[dict], one per document, parallel to _matrix rows


def _load():
    """Load persisted index + metadata into module globals."""
    global _vectorizer, _matrix, _metadata
    if _vectorizer is None and os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "rb") as f:
            saved = pickle.load(f)
        _vectorizer = saved["vectorizer"]
        _matrix     = saved["matrix"]
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    return _vectorizer, _matrix, _metadata


# ── Rich text builder ──────────────────────────────────────────────────────
def _build_doc(row):
    """Combine all CSV fields into one searchable text string."""
    # Repeat important fields to increase their TF-IDF weight
    is_num   = str(row.get("IS_number", ""))
    title    = str(row.get("title", ""))
    category = str(row.get("category", ""))
    scope    = str(row.get("scope_description", ""))
    refs     = str(row.get("normative_refs", ""))
    version  = str(row.get("latest_version", ""))
    cert     = str(row.get("certification_required", ""))

    return (
        f"{is_num} {is_num} "       # repeat IS number for higher weight
        f"{title} {title} "         # repeat title
        f"{category} "
        f"{scope} "
        f"References: {refs} "
        f"Version: {version} "
        f"Certification: {cert}"
    )


# ── Ingestion ──────────────────────────────────────────────────────────────
def ingest(force=False):
    """
    Read CSV -> build TF-IDF vector store -> persist to disk.
    Skips if index already exists (unless force=True).
    Returns the number of records stored.
    """
    global _vectorizer, _matrix, _metadata

    if os.path.exists(INDEX_PATH) and not force:
        vec, mat, meta = _load()
        n = mat.shape[0] if mat is not None else 0
        print(f"[embeddings] Index already exists with {n} records. Use --force to rebuild.")
        return n

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)
    df.fillna("", inplace=True)
    print(f"[embeddings] Loaded {len(df)} rows from CSV.")

    # Build documents and metadata in parallel
    docs  = []
    metas = []
    for _, row in df.iterrows():
        doc = _build_doc(row)
        docs.append(doc)
        metas.append({
            "IS_number"             : str(row.get("IS_number", "")),
            "title"                 : str(row.get("title", "")),
            "category"              : str(row.get("category", "")),
            "latest_version"        : str(row.get("latest_version", "")),
            "amendment"             : str(row.get("amendment", "")),
            "normative_refs"        : str(row.get("normative_refs", "")),
            "certification_required": str(row.get("certification_required", "")),
            "scope_description"     : str(row.get("scope_description", "")),
            "document_text"         : doc,
        })

    print(f"[embeddings] Building TF-IDF matrix ({len(docs)} docs) ...")
    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),        # unigrams + bigrams
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,         # log(1+tf) for better scaling
        token_pattern=r"(?u)\b[\w\.]+\b",  # keep IS numbers with dots
    )
    matrix = vectorizer.fit_transform(docs)
    print(f"[embeddings] Matrix shape: {matrix.shape}  (docs x features)")

    # Persist
    with open(INDEX_PATH, "wb") as f:
        pickle.dump({"vectorizer": vectorizer, "matrix": matrix}, f, protocol=4)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metas, f, ensure_ascii=False, indent=2)

    _vectorizer = vectorizer
    _matrix     = matrix
    _metadata   = metas

    print(f"[embeddings] Done! {len(metas)} records stored.")
    print(f"  Index    : {INDEX_PATH}")
    print(f"  Metadata : {METADATA_PATH}")
    return len(metas)


# ── Similarity search ──────────────────────────────────────────────────────
def similarity_search(query, n_results=5, category_filter=None):
    """
    Semantic (TF-IDF cosine) search over BIS standards.

    Args:
        query           : Free-text query (tender excerpt, IS number, product name, etc.)
        n_results       : Number of top results to return
        category_filter : Optional exact category string to restrict results

    Returns:
        List of dicts — metadata fields + 'similarity_score' (0-1)
    """
    vec, mat, meta = _load()
    if vec is None:
        print("[embeddings] No index found — running ingest() ...")
        ingest()
        vec, mat, meta = _load()

    q_vec   = vec.transform([query])
    scores  = cosine_similarity(q_vec, mat).flatten()

    # Sort descending
    ranked  = np.argsort(scores)[::-1]

    results = []
    for i in ranked:
        if len(results) >= n_results:
            break
        score  = float(scores[i])
        record = dict(meta[i])
        record["similarity_score"] = round(score, 4)

        if category_filter and record.get("category", "").strip() != category_filter.strip():
            continue
        results.append(record)

    return results


# ── Stats ──────────────────────────────────────────────────────────────────
def get_collection_stats():
    vec, mat, meta = _load()
    return {
        "backend"       : "TF-IDF cosine (scikit-learn)",
        "total_records" : mat.shape[0] if mat is not None else 0,
        "features"      : mat.shape[1] if mat is not None else 0,
        "index_path"    : INDEX_PATH,
        "metadata_path" : METADATA_PATH,
    }


# ── CLI ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="BIS Standards -> TF-IDF vector DB")
    ap.add_argument("--force", action="store_true", help="Re-ingest even if index already exists")
    ap.add_argument("--stats", action="store_true", help="Print index stats and exit")
    ap.add_argument("--query", type=str,            help="Run a test similarity query after ingest")
    ap.add_argument("--n",     type=int, default=3, help="Number of results for test query")
    args = ap.parse_args()

    if args.stats:
        print(json.dumps(get_collection_stats(), indent=2))
        sys.exit(0)

    count = ingest(force=args.force)
    print("\n" + "=" * 62)
    print(f"  Vector DB ready — {count} BIS standards indexed")
    print(f"  Index    : {INDEX_PATH}")
    print(f"  Metadata : {METADATA_PATH}")
    print("=" * 62)

    if args.query:
        print(f"\nTest query: '{args.query}'\n")
        hits = similarity_search(args.query, n_results=args.n)
        for idx_n, h in enumerate(hits, 1):
            print(f"  [{idx_n}]  {h['IS_number']}  -  {h['title']}")
            print(f"        Category : {h['category']}")
            print(f"        Score    : {h['similarity_score']:.4f}")
            print()
