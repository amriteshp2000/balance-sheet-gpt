# backend/main_pinecone.py - FastAPI Backend with Pinecone
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import yaml
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
import sys
import tempfile
import uvicorn
import traceback
import io
import numpy as np
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

# Add parent directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

print(f"📁 Project root: {PROJECT_ROOT}")

# Import Pinecone-based modules
try:
    from src.pdf_parser_pinecone import extract_text_from_pdf, save_to_vector_db, chat_with_context, find_relevant_chunks
    print("✅ Imported pdf_parser_pinecone")
except ImportError as e:
    print(f"❌ Error importing pdf_parser_pinecone: {e}")
    raise

try:
    from src.display import markdown_to_df
    print("✅ Imported display")
except ImportError as e:
    print(f"❌ Error importing display: {e}")
    raise

app = FastAPI(title="Balance Sheet GPT API (Pinecone)", version="2.0.0")

# CORS - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Load config
CONFIG_PATHS = [
    os.path.join(PROJECT_ROOT, 'config.yaml'),
    'config.yaml',
    '../config.yaml'
]

config = None
for path in CONFIG_PATHS:
    if os.path.exists(path):
        print(f"✅ Loading config from: {path}")
        with open(path) as file:
            config = yaml.load(file, Loader=yaml.SafeLoader)
        break

if not config:
    print("⚠️ No config.yaml found")
    config = {'credentials': {'usernames': {}}}

# ============================================================================
# MODELS
# ============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class ChatRequest(BaseModel):
    query: str
    role: str
    company: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    context_used: bool

class DashboardDataRequest(BaseModel):
    role: str
    company: Optional[str] = None
    query: Optional[str] = "summary"

class FileUploadResponse(BaseModel):
    success: bool
    message: str
    word_count: int
    file_path: str
    markdown_preview: Optional[str] = None

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def clean_dataframe_for_json(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans a dataframe to ensure it's JSON-serializable.
    Handles NaN, Inf, and other non-JSON-compliant values.
    """
    if df is None or df.empty:
        return df
    
    # Replace NaN and Inf with None (null in JSON)
    df = df.replace([np.inf, -np.inf], None)
    df = df.where(pd.notnull(df), None)
    
    return df

def dataframe_to_serializable(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Converts a dataframe to a JSON-serializable format.
    Returns dict with headers and rows, handling all edge cases.
    """
    if df is None:
        return {"headers": [], "rows": []}
    
    try:
        # Clean the dataframe first
        df = clean_dataframe_for_json(df)
        
        # Convert to lists
        headers = df.columns.tolist()
        rows = df.values.tolist()
        
        # Additional safety: convert any remaining problematic values
        clean_rows = []
        for row in rows:
            clean_row = []
            for val in row:
                # Handle various problematic types
                if isinstance(val, (np.floating, float)) and (np.isnan(val) or np.isinf(val)):
                    clean_row.append(None)
                elif isinstance(val, np.integer):
                    clean_row.append(int(val))
                elif isinstance(val, np.floating):
                    clean_row.append(float(val))
                elif pd.isna(val):
                    clean_row.append(None)
                else:
                    clean_row.append(val)
            clean_rows.append(clean_row)
        
        return {"headers": headers, "rows": clean_rows}
    
    except Exception as e:
        print(f"⚠️ Error converting dataframe to serializable: {e}")
        return {"headers": [], "rows": []}

# ============================================================================
# AUTH
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_password(plain: str, hashed: str) -> bool:
    if not hashed.startswith('$2b$'):
        return plain == hashed
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# ============================================================================
# ROUTES
# ============================================================================

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        users = config['credentials']['usernames']
        if request.username not in users:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_data = users[request.username]
        if not verify_password(request.password, user_data['password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token(
            data={
                "sub": request.username,
                "role": user_data.get("role", "analyst"),
                "company": user_data.get("company")
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "username": request.username,
                "name": user_data['name'],
                "role": user_data.get("role", "analyst"),
                "company": user_data.get("company")
            }
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    users = config['credentials']['usernames']
    username = token_data["sub"]
    if username not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = users[username]
    return {
        "username": username,
        "name": user_data['name'],
        "role": user_data.get("role", "analyst"),
        "company": user_data.get("company")
    }

@app.post("/api/upload", response_model=FileUploadResponse)
async def upload_pdf(file: UploadFile = File(...), token_data: dict = Depends(verify_token)):
    try:
        print(f"📄 Upload from: {token_data['sub']}, File: {file.filename}")
        
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        # Read file
        file_content = await file.read()
        file_like = io.BytesIO(file_content)
        file_like.name = file.filename
        
        # Extract text
        print("🔄 Extracting text...")
        markdown_text, file_path = extract_text_from_pdf(file_like)
        word_count = len(markdown_text.split())
        
        if word_count < 50:
            raise HTTPException(status_code=400, detail="PDF could not be parsed")
        
        # Save to Pinecone
        print("💾 Saving to Pinecone...")
        save_to_vector_db(markdown_text, metadata={
            "source": "pdf_from_user",
            "role": token_data.get("role", "analyst"),
            "user": token_data["sub"],
            "filename": file.filename,
            "company": token_data.get("company")
        })
        
        preview = markdown_text[:500] + "..." if len(markdown_text) > 500 else markdown_text
        print("✅ Upload complete!")
        
        return {
            "success": True,
            "message": f"Successfully processed {file.filename}",
            "word_count": word_count,
            "file_path": file_path,
            "markdown_preview": preview
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dashboard/data")
async def get_dashboard_data(request: DashboardDataRequest, token_data: dict = Depends(verify_token)):
    """
    Returns ALL financial data available to the user's role/company.
    The query parameter is optional and defaults to 'summary' which returns everything.
    """
    try:
        print(f"📊 Dashboard Request: Role={request.role}, Company={request.company}, Query={request.query}")
        
        # CRITICAL FIX: Always pass role and company to get ALL their data
        # The query defaults to "summary" which triggers the "fetch all" logic
        chunks = find_relevant_chunks(
            query=request.query or "summary",  # "summary" = fetch all
            role=request.role,
            company=request.company,
            top_k=10000  # High limit for dashboard (gets all data)
        )
        
        print(f"✅ Retrieved {len(chunks)} chunks for role={request.role}")
        
        # Convert chunks to table format with proper error handling
        tables = []
        for idx, chunk in enumerate(chunks):
            try:
                df = markdown_to_df(chunk)
                
                if df is not None and not df.empty:
                    # Use the safe conversion function
                    table_data = dataframe_to_serializable(df)
                    tables.append({
                        "headers": table_data["headers"],
                        "rows": table_data["rows"],
                        "chunk_text": chunk[:500]  # Truncate to save bandwidth
                    })
                else:
                    # Include text chunks even if they're not tables
                    tables.append({
                        "headers": [],
                        "rows": [],
                        "chunk_text": chunk[:500]
                    })
            except Exception as e:
                print(f"⚠️ Error processing chunk {idx}: {e}")
                # Still include the chunk as text-only
                tables.append({
                    "headers": [],
                    "rows": [],
                    "chunk_text": chunk[:500],
                    "error": str(e)
                })
        
        return {
            "success": True, 
            "tables": tables, 
            "count": len(tables),
            "total_chunks": len(chunks)
        }
        
    except Exception as e:
        print(f"❌ Dashboard Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, token_data: dict = Depends(verify_token)):
    """
    Chat endpoint with role-based context filtering.
    Uses semantic search to find relevant chunks within the user's accessible data.
    """
    try:
        print(f"💬 Chat Request: Query='{request.query}', Role={request.role}, Company={request.company}")
        
        # Find context from Pinecone using semantic search
        # The query here is specific, so it will use embedding-based retrieval
        context_chunks = find_relevant_chunks(
            query=request.query,
            role=request.role,
            company=request.company,
            top_k=50  # Semantic search top results
        )
        
        print(f"🔍 Found {len(context_chunks)} relevant context chunks")
        
        if not context_chunks:
            return {
                "answer": "I couldn't find any relevant financial data to answer your question. Please try rephrasing or ensure data has been uploaded for your role.",
                "context_used": False
            }
        
        # Combine context
        context_text = "\n\n".join(context_chunks)
        
        # Truncate if too long (Mistral has token limits)
        MAX_CONTEXT_LENGTH = 15000
        if len(context_text) > MAX_CONTEXT_LENGTH:
            context_text = context_text[:MAX_CONTEXT_LENGTH] + "\n\n[Context truncated due to length]"
        
        # Get AI answer
        answer = chat_with_context(request.query, context_text)
        
        return {
            "answer": answer, 
            "context_used": True
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    try:
        from src.pdf_parser_pinecone import get_index_stats
        stats = get_index_stats()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "pinecone",
            "vectors": stats.get("total_vector_count", 0),
            "namespaces": stats.get("namespaces", {})
        }
    except Exception as e:
        return {
            "status": "degraded", 
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.get("/api/info")
async def api_info():
    return {
        "name": "Balance Sheet GPT API",
        "version": "2.0.0",
        "database": "Pinecone",
        "project_root": PROJECT_ROOT,
        "features": [
            "Role-based data access",
            "Company-level filtering",
            "PDF upload with OCR",
            "Semantic search",
            "Full data retrieval for dashboards"
        ]
    }

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 Balance Sheet GPT API (Pinecone)")
    print("="*60)
    print(f"📁 Project root: {PROJECT_ROOT}")
    print(f"💾 Database: Pinecone")
    print(f"🔐 JWT Secret: {SECRET_KEY[:10]}...")
    print("="*60 + "\n")

if __name__ == "__main__":
    print("\n🚀 Starting FastAPI Server with Pinecone")
    print(f"📍 URL: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)