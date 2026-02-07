# src/pdf_parser.py
# Enhanced version with automatic chunking for large PDFs
# Uses Mistral OCR API - better for messy tabulated data than PyMuPDF

from mistralai import Mistral
import tempfile, uuid, os, re, json
from sentence_transformers import SentenceTransformer
import numpy as np 
import faiss
import streamlit as st
import fitz  # PyMuPDF - only for page splitting, not OCR
from typing import Tuple, List, Dict


# ============================================================================
# MAIN EXTRACTION FUNCTION
# ============================================================================

def extract_text_from_pdf(uploaded_file):
    """
    Extract text from PDF using Mistral OCR with automatic chunking for large files.
    
    For files <= 30 pages: Processes entire file at once
    For files > 30 pages: Splits into chunks, processes separately, merges results
    
    Args:
        uploaded_file: Streamlit uploaded file object
    
    Returns:
        Tuple of (markdown_text, temp_path)
    """
    # Save uploaded file
    temp_path = os.path.join(tempfile.gettempdir(), f"upload_{uuid.uuid4()}.pdf")
    with open(temp_path, "wb") as f:
        f.write(uploaded_file.read())
    
    # Check file size
    doc = fitz.open(temp_path)
    total_pages = len(doc)
    doc.close()
    
    # Estimate words (30 pages ≈ 7500 words for typical financial docs)
    if total_pages <= 30:
        st.info(f"📄 Processing {total_pages} pages in single pass...")
        markdown_text = _process_single_file(temp_path, uploaded_file.name)
    else:
        st.info(f"📚 Large file detected ({total_pages} pages). Using chunked processing...")
        markdown_text = _process_large_file(temp_path, uploaded_file.name, total_pages)
    
    return markdown_text, temp_path


# ============================================================================
# PROCESSING STRATEGIES
# ============================================================================

def _process_single_file(pdf_path: str, filename: str) -> str:
    """Process entire PDF with Mistral OCR (for files <= 30 pages)"""
    client = Mistral(api_key=st.secrets["MISTRAL_API_KEY"])
    
    # Upload to Mistral
    with open(pdf_path, "rb") as f:
        file_upload = client.files.upload(
            file={
                "file_name": filename,
                "content": f
            },
            purpose="ocr"
        )
    
    signed_url = client.files.get_signed_url(file_id=file_upload.id).url
    
    # Enhanced prompt for financial documents
    prompt_text = (
        "Extract all financial data from this document including:\n"
        "- Balance Sheet tables with all line items and periods\n"
        "- P&L / Income Statement with all revenue and expense categories\n"
        "- Cash Flow Statement\n"
        "- Inventory data and segment information\n"
        "- All numerical data, percentages, and KPIs\n\n"
        "Format as clean markdown tables using | separators.\n"
        "Preserve exact numbers including decimals and commas.\n"
        "Keep table headers and maintain row/column alignment.\n"
        "If a table spans multiple pages, include all rows together."
    )
    
    response = client.chat.complete(
        model="mistral-medium-latest",
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
    
    return response.choices[0].message.content.strip()


def _process_large_file(pdf_path: str, filename: str, total_pages: int) -> str:
    """
    Process large PDF by splitting into chunks and merging results.
    
    Strategy:
    - Split into 30-page chunks (≈7500 words each)
    - 2-page overlap between chunks to preserve tables
    - Process each chunk with Mistral OCR
    - Merge results with deduplication
    """
    MAX_PAGES_PER_CHUNK = 30
    OVERLAP_PAGES = 2
    
    doc = fitz.open(pdf_path)
    
    # Create chunk boundaries
    chunks = []
    current_start = 0
    
    while current_start < total_pages:
        current_end = min(current_start + MAX_PAGES_PER_CHUNK, total_pages)
        chunks.append((current_start, current_end))
        
        # Next chunk starts with overlap (but not beyond total pages)
        if current_end < total_pages:
            current_start = current_end - OVERLAP_PAGES
        else:
            current_start = current_end
    
    st.info(f"📦 Processing in {len(chunks)} chunks with {OVERLAP_PAGES}-page overlap")
    
    # Progress tracking
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    # Process each chunk
    chunk_results = []
    temp_dir = tempfile.gettempdir()
    
    for i, (start_page, end_page) in enumerate(chunks):
        status_text.text(f"Processing chunk {i+1}/{len(chunks)}: pages {start_page+1}-{end_page}")
        progress_bar.progress((i + 1) / len(chunks))
        
        # Extract pages for this chunk
        chunk_doc = fitz.open()
        chunk_doc.insert_pdf(doc, from_page=start_page, to_page=end_page-1)
        
        chunk_path = os.path.join(temp_dir, f"chunk_{i}_{uuid.uuid4()}.pdf")
        chunk_doc.save(chunk_path)
        chunk_doc.close()
        
        # Process with Mistral OCR
        try:
            chunk_text = _process_single_file(chunk_path, f"{filename}_chunk_{i+1}")
            chunk_results.append({
                'text': chunk_text,
                'start_page': start_page,
                'end_page': end_page
            })
        except Exception as e:
            st.warning(f"⚠️ Error processing chunk {i+1}: {e}")
            chunk_results.append({
                'text': f"[Error processing pages {start_page+1}-{end_page}]",
                'start_page': start_page,
                'end_page': end_page
            })
        finally:
            # Cleanup
            if os.path.exists(chunk_path):
                os.remove(chunk_path)
    
    doc.close()
    progress_bar.progress(1.0)
    status_text.text("✅ All chunks processed! Merging results...")
    
    # Merge chunks
    merged_text = _merge_chunks(chunk_results)
    
    status_text.empty()
    progress_bar.empty()
    
    return merged_text


def _merge_chunks(chunks: List[Dict]) -> str:
    """
    Merge chunk results with intelligent deduplication.
    
    Removes duplicate tables that appear in overlap regions.
    """
    if not chunks:
        return ""
    
    if len(chunks) == 1:
        return chunks[0]['text']
    
    # Combine all chunks
    combined_parts = []
    for i, chunk in enumerate(chunks):
        # Add page marker for reference
        if i > 0:
            combined_parts.append(f"\n<!-- Pages {chunk['start_page']+1}-{chunk['end_page']} -->\n")
        combined_parts.append(chunk['text'])
    
    combined_text = "\n\n".join(combined_parts)
    
    # Remove duplicate tables
    deduplicated = _remove_duplicate_tables(combined_text)
    
    # Clean up page markers
    deduplicated = re.sub(r'<!-- Pages \d+-\d+ -->', '', deduplicated)
    
    return deduplicated


def _remove_duplicate_tables(text: str) -> str:
    """
    Remove duplicate markdown tables.
    
    Strategy:
    - Detect tables by markdown syntax (| at start/end of lines)
    - Create signature from header row + first data row
    - Keep only first occurrence of each unique table
    """
    lines = text.split('\n')
    result = []
    
    current_table = []
    in_table = False
    seen_signatures = set()
    
    for line in lines:
        stripped = line.strip()
        
        # Table row detection
        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            current_table.append(line)
        else:
            # End of table
            if in_table and current_table:
                # Check for duplicates
                if len(current_table) >= 2:
                    # Create signature from first 2 rows
                    signature = '\n'.join(current_table[:2])
                    # Normalize (remove varying whitespace)
                    sig_normalized = re.sub(r'\s+', ' ', signature).lower()
                    
                    if sig_normalized not in seen_signatures:
                        # New table - keep it
                        result.extend(current_table)
                        seen_signatures.add(sig_normalized)
                    # else: duplicate - skip
                else:
                    # Single-row table - keep it
                    result.extend(current_table)
                
                current_table = []
                in_table = False
            
            # Add non-table line
            result.append(line)
    
    # Handle table at end of file
    if current_table:
        if len(current_table) >= 2:
            signature = '\n'.join(current_table[:2])
            sig_normalized = re.sub(r'\s+', ' ', signature).lower()
            if sig_normalized not in seen_signatures:
                result.extend(current_table)
        else:
            result.extend(current_table)
    
    return '\n'.join(result)


# ============================================================================
# VECTOR DATABASE FUNCTIONS
# ============================================================================

def save_to_vector_db(text, metadata=None):
    """Save text chunks to vector database with deduplication"""
    import hashlib

    def hash_id(content):
        return hashlib.md5(content.encode()).hexdigest()

    os.makedirs("db", exist_ok=True)

    # Smart chunking - preserve table boundaries
    chunks = _smart_chunk_for_db(text)
    chunks = [c for c in chunks if len(c.strip()) > 50]

    # Load existing docs
    existing_docs = []
    docs_path = "db/docs.jsonl"
    if os.path.exists(docs_path):
        with open(docs_path, "r", encoding="utf-8") as f:
            existing_docs = [json.loads(l) for l in f]
    existing_ids = {doc["id"] for doc in existing_docs}

    # Add new unique chunks
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

    # Save to disk
    with open(docs_path, "w", encoding="utf-8") as f:
        for doc in all_docs:
            f.write(json.dumps(doc) + "\n")

    # Rebuild FAISS index
    embedder = SentenceTransformer("./model_cache/all-MiniLM-L6-v2", device="cpu")
    vectors = embedder.encode([d["content"] for d in all_docs])
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))
    faiss.write_index(index, "db/vector_index.faiss")

    print(f"✅ Saved {len(new_docs)} new chunks. Total: {len(all_docs)}")


def _smart_chunk_for_db(text: str, max_size: int = 1500) -> List[str]:
    """
    Chunk text intelligently, keeping tables together.
    
    Rules:
    - Never split a markdown table
    - Combine small chunks
    - Split large non-table sections on paragraph boundaries
    """
    # Split on double newlines
    sections = re.split(r'\n\n+', text)
    
    chunks = []
    current_chunk = ""
    
    for section in sections:
        # Check if this is a table
        is_table = '|' in section and section.count('|') > 2
        
        if is_table:
            # Tables should be kept whole
            if len(current_chunk) + len(section) < max_size * 1.5:  # Allow tables to exceed slightly
                current_chunk += "\n\n" + section
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = section
        else:
            # Regular text - can be split
            if len(current_chunk) + len(section) < max_size:
                current_chunk += "\n\n" + section
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = section
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks


def chat_with_context(query, context_text):
    """Chat with financial context using Mistral"""
    client = Mistral(api_key=st.secrets["MISTRAL_API_KEY"])
    
    # Ensure context fits (leave room for query + response)
    max_context_words = 7000
    context_words = context_text.split()
    
    if len(context_words) > max_context_words:
        # Truncate but try to keep complete tables
        context_text = _truncate_smart(context_text, max_context_words)
    
    response = client.chat.complete(
        model="ministral-8b-latest",
        messages=[
            {
                "role": "system", 
                "content": (
                    "You are a helpful financial assistant. "
                    "Answer based only on the provided context. "
                    "Cite specific numbers from tables when relevant. "
                    "If the answer is not in the context, say so clearly."
                )
            },
            {"role": "user", "content": f"Context:\n{context_text}"},
            {"role": "user", "content": query}
        ]
    )
    return response.choices[0].message.content.strip()


def _truncate_smart(text: str, max_words: int) -> str:
    """Truncate text while preserving complete tables"""
    sections = re.split(r'\n\n+', text)
    result = []
    word_count = 0
    
    for section in sections:
        section_words = len(section.split())
        
        if word_count + section_words <= max_words:
            result.append(section)
            word_count += section_words
        else:
            # If it's a table, skip rather than truncate mid-table
            if '|' in section:
                break
            else:
                # Add partial text
                remaining = max_words - word_count
                result.append(' '.join(section.split()[:remaining]))
                break
    
    return '\n\n'.join(result)