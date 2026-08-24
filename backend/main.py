# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.models.search_engine import StandardsSearchEngine
from backend.utils.translator import translate_to_english
import pdfplumber

app = FastAPI(title="IS Standards Recommender")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = StandardsSearchEngine()

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    language: str = "en"

@app.post("/recommend")
def recommend_standards(request: QueryRequest):
    query = request.query
    if request.language != "en":
        query = translate_to_english(query)

    results = engine.search(query, request.top_k)
    return {"original_query": request.query, "recommendations": results}

@app.post("/recommend-from-file")
async def recommend_from_file(file: UploadFile = File(...)):
    text = ""
    if file.filename.endswith('.pdf'):
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    else:
        text = (await file.read()).decode('utf-8')

    results = engine.search(text[:1000], top_k=5)
    return {"extracted_text_preview": text[:200], "recommendations": results}

@app.get("/")
def health_check():
    return {"status": "running"}