# src/pdf_parser_pinecone.py
import os
import re
import uuid
import hashlib
import tempfile
import fitz  # PyMuPDF
from datetime import datetime
from typing import Tuple, List, Dict, Any, Optional
from dotenv import load_dotenv
from mistralai import Mistral
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

load_dotenv()

# ============================================================================
# RESOURCE MANAGEMENT (SINGLETON)
# ============================================================================

class PineconeManager:
    """Manages Pinecone and Embedding model lifecycle for FastAPI performance."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PineconeManager, cls).__new__(cls)
            cls._instance._init_resources()
        return cls._instance

    def _init_resources(self):
        # Configuration
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = "reliance-financial-data"
        self.dimension = 384  # Matches all-MiniLM-L6-v2
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY not found in environment.")

        # Initialize Pinecone
        self.pc = Pinecone(api_key=self.api_key)
        
        # Ensure Index exists
        existing_indices = [idx.name for idx in self.pc.list_indexes()]
        if self.index_name not in existing_indices:
            print(f"🚀 Creating Pinecone index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        
        self.index = self.pc.Index(self.index_name)
        
        # Load Embedder
        print("📥 Loading sentence transformer model...")
        model_path = "./model_cache/all-MiniLM-L6-v2"
        self.embedder = SentenceTransformer(
            model_path if os.path.exists(model_path) else "all-MiniLM-L6-v2", 
            device="cpu"
        )

# Global Accessor
manager = PineconeManager()

# ============================================================================
# CORE RETRIEVAL LOGIC (FIXED FOR ROLE-BASED DATA)
# ============================================================================

def find_relevant_chunks(query: str, role: str = None, company: str = None, top_k: int = 50) -> List[str]:
    """
    Finds chunks from Pinecone. 
    If query is generic (summary/all), it fetches ALL data matching the role/company filters.
    For specific queries, uses semantic search within the filtered data.
    """
    # Detect if user wants 'all' data or a specific search
    is_generic = not query or query.lower().strip() in ["summary", "all", "segment", "data", "report", ""]
    
    # Build Filter - CRITICAL: Filter by role/company
    filter_dict = {}
    if role:
        filter_dict["role"] = role
    if company:
        filter_dict["company"] = company

    if is_generic and filter_dict:
        # USER WANTS ALL DATA FOR THEIR ROLE
        # Fetch ALL matching vectors using high top_k
        # Pinecone serverless supports up to 10,000 per query
        vector_to_search = [0.0] * manager.dimension  # Dummy vector
        
        results = manager.index.query(
            vector=vector_to_search,
            top_k=10000,  # Max limit to get all data
            filter=filter_dict,
            include_metadata=True
        )
        
        all_chunks = [match.metadata['text'] for match in results.matches if 'text' in match.metadata]
        print(f"📊 Retrieved ALL {len(all_chunks)} chunks for role={role}, company={company}")
        return all_chunks
    else:
        # SPECIFIC QUERY: Use semantic search
        vector_to_search = manager.embedder.encode(query).tolist()
        
        results = manager.index.query(
            vector=vector_to_search,
            top_k=top_k,
            filter=filter_dict if filter_dict else None,
            include_metadata=True
        )
        
        chunks = [match.metadata['text'] for match in results.matches if 'text' in match.metadata]
        print(f"🔍 Retrieved {len(chunks)} semantically relevant chunks for query='{query}'")
        return chunks

# ============================================================================
# PDF EXTRACTION & OCR LOGIC
# ============================================================================

def extract_text_from_pdf(uploaded_file) -> Tuple[str, str]:
    """Extract text from PDF using Mistral OCR with automatic large-file handling."""
    temp_path = os.path.join(tempfile.gettempdir(), f"upload_{uuid.uuid4()}.pdf")
    
    if hasattr(uploaded_file, 'read'):
        content = uploaded_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        filename = getattr(uploaded_file, 'name', 'document.pdf')
    else:
        temp_path = uploaded_file
        filename = os.path.basename(uploaded_file)

    doc = fitz.open(temp_path)
    total_pages = len(doc)
    doc.close()

    if total_pages <= 30:
        markdown_text = _process_mistral_ocr(temp_path, filename)
    else:
        markdown_text = _process_large_file(temp_path, filename, total_pages)

    return markdown_text, temp_path

def _process_mistral_ocr(pdf_path: str, filename: str) -> str:
    """Mistral OCR Call."""
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError("MISTRAL_API_KEY missing.")
        
    client = Mistral(api_key=api_key)

    with open(pdf_path, "rb") as f:
        file_upload = client.files.upload(
            file={"file_name": filename, "content": f},
            purpose="ocr"
        )

    signed_url = client.files.get_signed_url(file_id=file_upload.id).url
    
    prompt = (
        "Extract all financial data including Balance Sheets and P&L statements. "
        "Format as clean markdown tables using | separators. Preserve exact numbers."
    )

    response = client.chat.complete(
        model="mistral-medium-latest",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "document_url", "document_url": signed_url}
            ]
        }]
    )
    return response.choices[0].message.content.strip()

def _process_large_file(pdf_path: str, filename: str, total_pages: int) -> str:
    """Splits large PDF into chunks, processes, and merges."""
    MAX_PAGES = 30
    OVERLAP = 2
    chunk_results = []
    doc = fitz.open(pdf_path)
    
    current_start = 0
    while current_start < total_pages:
        current_end = min(current_start + MAX_PAGES, total_pages)
        
        # Extract chunk
        chunk_doc = fitz.open()
        chunk_doc.insert_pdf(doc, from_page=current_start, to_page=current_end-1)
        chunk_path = os.path.join(tempfile.gettempdir(), f"chunk_{uuid.uuid4()}.pdf")
        chunk_doc.save(chunk_path)
        chunk_doc.close()
        
        try:
            text = _process_mistral_ocr(chunk_path, f"{filename}_part")
            chunk_results.append({'text': text, 'start_page': current_start, 'end_page': current_end})
        finally:
            if os.path.exists(chunk_path): os.remove(chunk_path)
            
        current_start = current_end - OVERLAP if current_end < total_pages else current_end

    doc.close()
    return _merge_chunks(chunk_results)

# ============================================================================
# STORAGE & CHUNKING
# ============================================================================

def save_to_vector_db(text: str, metadata: Dict[str, Any] = None):
    """Saves text to Pinecone with provided metadata."""
    chunks = _smart_chunk_for_db(text)
    vectors_to_upsert = []

    for i, chunk in enumerate(chunks):
        if len(chunk.strip()) < 50: continue
        
        embedding = manager.embedder.encode(chunk).tolist()
        chunk_id = hashlib.md5(f"{chunk[:100]}_{i}".encode()).hexdigest()
        
        clean_meta = {
            "text": chunk,
            "chunk_index": i,
            "timestamp": datetime.utcnow().isoformat()
        }
        if metadata:
            for k, v in metadata.items():
                if v is not None: clean_meta[k] = v

        vectors_to_upsert.append({"id": chunk_id, "values": embedding, "metadata": clean_meta})

    # Batch Upsert (100 at a time)
    for i in range(0, len(vectors_to_upsert), 100):
        manager.index.upsert(vectors=vectors_to_upsert[i:i + 100])

def _smart_chunk_for_db(text: str, max_size: int = 1500) -> List[str]:
    """Chunks text while trying to keep tables together."""
    sections = re.split(r'\n\n+', text)
    chunks, current_chunk = [], ""
    
    for section in sections:
        if len(current_chunk) + len(section) < max_size:
            current_chunk += "\n\n" + section
        else:
            if current_chunk: chunks.append(current_chunk.strip())
            current_chunk = section
            
    if current_chunk: chunks.append(current_chunk.strip())
    return chunks

# ============================================================================
# TEXT UTILITIES (DEDUPLICATION & MERGING)
# ============================================================================

def _merge_chunks(chunks: List[Dict]) -> str:
    combined = "\n\n".join([c['text'] for c in chunks])
    return _remove_duplicate_tables(combined)

def _remove_duplicate_tables(text: str) -> str:
    lines = text.split('\n')
    result, seen_sigs, current_table = [], set(), []
    in_table = False

    for line in lines:
        if line.strip().startswith('|'):
            in_table = True
            current_table.append(line)
        else:
            if in_table:
                if len(current_table) >= 2:
                    sig = re.sub(r'\s+', ' ', "".join(current_table[:2])).lower()
                    if sig not in seen_sigs:
                        result.extend(current_table)
                        seen_sigs.add(sig)
                current_table, in_table = [], False
            result.append(line)
    return "\n".join(result)

# ============================================================================
# AI & STATS
# ============================================================================

def chat_with_context(query: str, context: str) -> str:
    client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
    response = client.chat.complete(
        model="ministral-8b-latest",
        messages=[
            {"role": "system", "content": "Financial assistant. Answer only using context provided."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}"}
        ]
    )
    return response.choices[0].message.content.strip()

def get_index_stats():
    return manager.index.describe_index_stats().to_dict()

def delete_all_vectors():
    manager.index.delete(delete_all=True)