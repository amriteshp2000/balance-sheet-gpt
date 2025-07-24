# src/chat_over_vector_db.py
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

def load_vector_data(role=None, company=None):
    with open("db/docs.jsonl", "r", encoding="utf-8") as f:
        docs = [json.loads(line) for line in f]
    if role:
        docs = [d for d in docs if role in d["metadata"].get("role", [])]
    if company:
        docs = [d for d in docs if d["metadata"].get("company") == company]
    return docs

def find_relevant_chunks(query, role, company=None, k=5):
    docs = load_vector_data(role, company)
    if not docs: return []

    corpus = [d["content"] for d in docs]
    embedder = SentenceTransformer('./model_cache/all-MiniLM-L6-v2', device='cpu')
    print("Model loaded successfully")

    vectors = embedder.encode(corpus)

    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))
    query_vec = embedder.encode([query])
    D, I = index.search(np.array(query_vec).astype("float32"), k)
    return [corpus[i] for i in I[0]]
