# scripts/build_embeddings.py
from sentence_transformers import SentenceTransformer
import pandas as pd
import faiss
import numpy as np

model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

df = pd.read_csv('data/processed/standards_clean.csv')
texts = df['combined_text'].tolist()

embeddings = model.encode(texts, show_progress_bar=True).astype('float32')

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, 'data/embeddings/bis_index.faiss')
df.to_pickle('data/embeddings/standards_metadata.pkl')

print(f"Indexed {len(texts)} standards")