import os
import json
import hashlib
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

VECTOR_PATH = "db/vector_index.faiss"
DOCS_PATH = "db/docs.jsonl"
SIMILARITY_THRESHOLD = 0.97  # Cosine similarity threshold to merge similar chunks

def hash_chunk(content):
    return hashlib.md5(content.strip().encode()).hexdigest()

def read_docs():
    if not os.path.exists(DOCS_PATH):
        return []
    with open(DOCS_PATH, "r", encoding="utf-8") as f:
        return [json.loads(line.strip()) for line in f]

def write_docs(docs):
    with open(DOCS_PATH, "w", encoding="utf-8") as f:
        for doc in docs:
            f.write(json.dumps(doc) + "\n")

def is_duplicate_text(text1, text2):
    return text1.strip() == text2.strip()

def is_similar_text(text1, text2, model, threshold=SIMILARITY_THRESHOLD):
    v1, v2 = model.encode([text1, text2])
    dot = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    return dot >= threshold

def clean_vector_db():
    print("🔍 Cleaning vector DB...")
    docs = read_docs()
    if not docs:
        print("📭 No records to clean.")
        return

    model = SentenceTransformer("all-MiniLM-L6-v2")
    cleaned = []
    seen_hashes = set()

    for i, doc in enumerate(tqdm(docs)):
        content = doc["content"]
        doc_id = hash_chunk(content)

        if doc_id in seen_hashes:
            continue

        duplicated = False
        for c in cleaned:
            if is_duplicate_text(content, c["content"]):
                duplicated = True
                break
            elif is_similar_text(content, c["content"], model):
                # Optionally merge or keep the latest copy
                print(f"↺ Merging similar chunk: {doc_id}")
                duplicated = True
                break

        if not duplicated:
            seen_hashes.add(doc_id)
            doc["id"] = doc_id
            cleaned.append(doc)

    print(f"🧹 Cleaned duplicate/similar entries: {len(docs) - len(cleaned)} removed")
    write_docs(cleaned)

    print("📦 Rebuilding FAISS index...")
    vectors = model.encode([doc["content"] for doc in cleaned])
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))
    faiss.write_index(index, VECTOR_PATH)

    print(f"✅ Vector DB cleaned and rebuilt with {len(cleaned)} unique chunks.")

if __name__ == "__main__":
    clean_vector_db()
