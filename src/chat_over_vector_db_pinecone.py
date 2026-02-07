# src/chat_over_vector_db_pinecone.py
# Pinecone-based vector search for chat functionality

from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
import streamlit as st
from typing import List


# Global variables
_pinecone_client = None
_pinecone_index = None
_embedder = None


def get_pinecone_index():
    """Get or create Pinecone index connection"""
    global _pinecone_client, _pinecone_index, _embedder
    
    if _pinecone_index is not None:
        return _pinecone_index, _embedder
    
    # Initialize Pinecone
    api_key = st.secrets.get("PINECONE_API_KEY") or os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise ValueError("PINECONE_API_KEY not found in secrets or environment")
    
    _pinecone_client = Pinecone(api_key=api_key)
    
    # Connect to existing index
    index_name = "reliance-financial-data"
    _pinecone_index = _pinecone_client.Index(index_name)
    
    # Load sentence transformer
    _embedder = SentenceTransformer("./model_cache/all-MiniLM-L6-v2", device="cpu")
    
    return _pinecone_index, _embedder


def find_relevant_chunks(query: str, role: str = None, company: str = None, top_k: int = 5) -> List[str]:
    """
    Find relevant chunks from Pinecone based on semantic search.
    
    Args:
        query: Search query (can be keywords or natural language)
        role: Filter by user role (analyst, ceo, inventory_manager, owner)
        company: Filter by company name (for CEO role)
        top_k: Number of results to return (default 5)
    
    Returns:
        List of relevant text chunks
    """
    try:
        index, embedder = get_pinecone_index()
        
        # Generate query embedding
        query_embedding = embedder.encode(query).tolist()
        
        # Build metadata filter
        filter_dict = {}
        
        if role:
            filter_dict["role"] = {"$eq": role}
        
        if company:
            filter_dict["company"] = {"$eq": company}
        
        # Query Pinecone
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        # Extract text chunks from results
        chunks = []
        for match in results.matches:
            if match.metadata and 'text' in match.metadata:
                chunks.append(match.metadata['text'])
        
        print(f"🔍 Found {len(chunks)} relevant chunks for query: '{query}'")
        return chunks
        
    except Exception as e:
        print(f"❌ Error finding relevant chunks: {e}")
        return []


def find_chunks_by_metadata(role: str = None, company: str = None, source: str = None, top_k: int = 10) -> List[str]:
    """
    Find chunks by metadata filters only (no semantic search).
    Useful for retrieving all documents for a specific role/company.
    
    Args:
        role: Filter by role
        company: Filter by company
        source: Filter by source
        top_k: Number of results
    
    Returns:
        List of text chunks
    """
    try:
        index, embedder = get_pinecone_index()
        
        # Build filter
        filter_dict = {}
        if role:
            filter_dict["role"] = {"$eq": role}
        if company:
            filter_dict["company"] = {"$eq": company}
        if source:
            filter_dict["source"] = {"$eq": source}
        
        # Create a dummy query vector (we'll filter by metadata only)
        # Use a zero vector for metadata-only queries
        dummy_vector = [0.0] * 384  # Dimension of all-MiniLM-L6-v2
        
        results = index.query(
            vector=dummy_vector,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        chunks = []
        for match in results.matches:
            if match.metadata and 'text' in match.metadata:
                chunks.append(match.metadata['text'])
        
        return chunks
        
    except Exception as e:
        print(f"❌ Error finding chunks by metadata: {e}")
        return []


def search_by_keyword(keyword: str, role: str = None, company: str = None, top_k: int = 5) -> List[str]:
    """
    Search for chunks containing specific keywords.
    Uses semantic search, so it will find related terms too.
    
    Args:
        keyword: Keyword to search for
        role: Filter by role
        company: Filter by company
        top_k: Number of results
    
    Returns:
        List of relevant chunks
    """
    return find_relevant_chunks(keyword, role=role, company=company, top_k=top_k)


def get_all_chunks_for_role(role: str, company: str = None, limit: int = 20) -> List[str]:
    """
    Get all chunks for a specific role (useful for dashboard).
    
    Args:
        role: User role
        company: Company filter (for CEO)
        limit: Maximum chunks to return
    
    Returns:
        List of all chunks for that role
    """
    # For dashboard, use generic queries based on role
    query_map = {
        "ceo": "summary financial overview",
        "inventory_manager": "inventory stock levels",
        "owner": "segment business unit",
        "analyst": "financial data"
    }
    
    query = query_map.get(role, "financial data")
    return find_relevant_chunks(query, role=role, company=company, top_k=limit)