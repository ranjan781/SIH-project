# backend/models/search_engine.py
from sentence_transformers import SentenceTransformer
import faiss
import pandas as pd
import numpy as np

class StandardsSearchEngine:
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        self.index = faiss.read_index('data/embeddings/bis_index.faiss')
        self.metadata = pd.read_pickle('data/embeddings/standards_metadata.pkl')

    def search(self, query: str, top_k: int = 5):
        query_embedding = self.model.encode([query]).astype('float32')
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx == -1:
                continue
            row = self.metadata.iloc[idx]
            confidence = max(0, round((1 - dist / 4) * 100, 1))
            results.append({
                "is_number": row['IS_number'],
                "title": row['title'],
                "scope": row['scope_description'],
                "confidence": confidence,
                "latest_version": row['latest_version'],
                "amendment": row.get('amendment', 'N/A'),
                "normative_refs": row.get('normative_refs', ''),
                "certification_required": row.get('certification_required', 'Not specified')
            })
        return results

    def get_allied_standards(self, category: str, exclude_is_number: str):
        allied = self.metadata[
            (self.metadata['category'] == category) &
            (self.metadata['IS_number'] != exclude_is_number)
        ].head(3)
        return allied[['IS_number', 'title']].to_dict('records')