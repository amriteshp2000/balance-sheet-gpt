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

# Add parent directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

print(f"📁 Project root: {PROJECT_ROOT}")

# Import Pinecone-based modules
try:
    from src.pdf_parser_pinecone import extract_text_from_pdf, save_to_vector_db, chat_with_context
    print("✅ Imported pdf_parser_pinecone")
except ImportError as e:
    print(f"❌ Error importing pdf_parser_pinecone: {e}")
    raise

try:
    from src.chat_over_vector_db_pinecone import find_relevant_chunks
    print("✅ Imported chat_over_vector_db_pinecone")
except ImportError as e:
    print(f"❌ Error importing chat_over_vector_db_pinecone: {e}")
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
    except jwt.JWTError:
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
    try:
        print(f"📊 Dashboard: Role={request.role}, Query={request.query}")
        
        # Find chunks from Pinecone
        chunks = find_relevant_chunks(
            query=request.query or "summary",
            role=request.role,
            company=request.company,
            top_k=10
        )
        
        print(f"✅ Found {len(chunks)} chunks")
        
        # Convert to tables
        tables = []
        for chunk in chunks:
            df = markdown_to_df(chunk)
            if df is not None:
                tables.append({
                    "headers": df.columns.tolist(),
                    "rows": df.values.tolist(),
                    "chunk_text": chunk
                })
            else:
                tables.append({
                    "headers": [],
                    "rows": [],
                    "chunk_text": chunk
                })
        
        return {"success": True, "tables": tables, "count": len(tables)}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, token_data: dict = Depends(verify_token)):
    try:
        print(f"💬 Chat: '{request.query}' (Role: {request.role})")
        
        # Find context from Pinecone
        context_chunks = find_relevant_chunks(
            query=request.query,
            role=request.role,
            company=request.company,
            top_k=100
        )
        
        print(f"🔍 Found {len(context_chunks)} context chunks")
        
        context_text = "\n\n".join(context_chunks) if context_chunks else "No relevant context found."
        
        # Get answer
        answer = chat_with_context(request.query, context_text)
        
        return {"answer": answer, "context_used": bool(context_chunks)}
        
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
            "vectors": stats.get("total_vectors", 0)
        }
    except:
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/info")
async def api_info():
    return {
        "name": "Balance Sheet GPT API",
        "version": "2.0.0",
        "database": "Pinecone",
        "project_root": PROJECT_ROOT
    }

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 Balance Sheet GPT API (Pinecone)")
    print("="*60)
    print(f"📁 Project root: {PROJECT_ROOT}")
    print(f"💾 Database: Pinecone")
    print("="*60 + "\n")

if __name__ == "__main__":
    print("\n🚀 Starting FastAPI Server with Pinecone")
    print(f"📍 URL: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)