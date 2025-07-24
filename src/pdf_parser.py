# src/pdf_parser.py
from mistralai import Mistral
import tempfile, uuid, os, re, json
from sentence_transformers import SentenceTransformer
import numpy as np, faiss
import streamlit as st


def extract_text_from_pdf(uploaded_file):
    temp_path = os.path.join(tempfile.gettempdir(), f"upload_{uuid.uuid4()}.pdf")

    with open(temp_path, "wb") as f:
        f.write(uploaded_file.read())

    client = Mistral(api_key=st.secrets["MISTRAL_API_KEY"])

    with open(temp_path, "rb") as f:
        file_upload = client.files.upload(
            file={
                "file_name": uploaded_file.name,
                "content": f
            },
            purpose="ocr"
        )

    # ✅ Correct: use keyword argument
    signed_url = client.files.get_signed_url(file_id=file_upload.id).url

    prompt_text = (
        "Extract all financial tables (Balance Sheet, P&L, Cash Flow) and KPIs "
        "in clean markdown format suitable for dashboards and charting."
    )

    response = client.chat.complete(
        model="mistral-small-2407",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "document_url", "document_url": signed_url}
                ]
            }
        ]
    )

    return response.choices[0].message.content.strip(), temp_path


def save_to_vector_db(text, metadata=None):
    import hashlib

    def hash_id(content):
        return hashlib.md5(content.encode()).hexdigest()

    os.makedirs("db", exist_ok=True)

    # Chunk the content
    chunks = re.split(r"\n{2,}", text.strip())
    chunks = [c for c in chunks if len(c) > 50]

    # Load existing docs if present
    existing_docs = []
    docs_path = "db/docs.jsonl"
    if os.path.exists(docs_path):
        with open(docs_path, "r", encoding="utf-8") as f:
            existing_docs = [json.loads(l) for l in f]
    existing_ids = {doc["id"] for doc in existing_docs}

    # New + unique chunks
    new_docs = []
    for c in chunks:
        doc_id = hash_id(c)
        if doc_id not in existing_ids:
            new_docs.append({
                "id": doc_id,
                "content": c,
                "metadata": metadata or {"role": "analyst"}
            })
            existing_ids.add(doc_id)

    all_docs = existing_docs + new_docs

    # Save final docs
    with open(docs_path, "w", encoding="utf-8") as f:
        for doc in all_docs:
            f.write(json.dumps(doc) + "\n")

    # Rebuild FAISS
    embedder = SentenceTransformer("./model_cache/all-MiniLM-L6-v2", device="cpu")
    print("Model loaded successfully")

    vectors = embedder.encode([d["content"] for d in all_docs])
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))
    faiss.write_index(index, "db/vector_index.faiss")

    print(f"✅ Saved {len(new_docs)} new chunks. Total index: {len(all_docs)}")



def chat_with_context(query, context_text):
    client = Mistral(api_key=st.secrets["MISTRAL_API_KEY"])
    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {"role": "system", "content": "You are a helpful financial assistant. Use only the context provided."},
            {"role": "user", "content": f"Context:\n{context_text[:8000]}"},
            {"role": "user", "content": query}
        ]
    )
    return response.choices[0].message.content.strip()
