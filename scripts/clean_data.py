# scripts/clean_data.py
import pandas as pd

df = pd.read_csv('C:\\Users\\Rajesh\\OneDrive\\Desktop\\SIH\\data\\raw\\data\\bis_standards_dataset_expanded.csv')

# Remove empty rows
df = df.dropna(subset=['title', 'scope_description'])

# Combine text for embedding
df['combined_text'] = df['title'].astype(str) + ". " + df['scope_description'].astype(str) + ". Category: " + df['category'].astype(str)

# Fill missing optional fields
df['normative_refs'] = df['normative_refs'].fillna('')
df['certification_required'] = df['certification_required'].fillna('Not specified')

df.to_csv('data/processed/standards_clean.csv', index=False)
print(f"Cleaned dataset: {len(df)} standards ready")