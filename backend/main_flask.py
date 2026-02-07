# backend/main_flask.py - Flask Backend Alternative
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import yaml
import jwt
import bcrypt
from datetime import datetime, timedelta
import os

# Import your existing modules
import sys
sys.path.append('..')
from src.pdf_parser_v1 import extract_text_from_pdf, save_to_vector_db, chat_with_context
from src.chat_over_vector_db import find_relevant_chunks
from src.display import markdown_to_df

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Load config
with open('../config.yaml') as file:
    config = yaml.load(file, Loader=yaml.SafeLoader)

# ============================================================================
# AUTHENTICATION HELPERS
# ============================================================================

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password.startswith('$2b$'):
        return plain_password == hashed_password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.JWTError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ============================================================================
# ROUTES - Authentication
# ============================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    users = config['credentials']['usernames']
    if username not in users:
        return jsonify({'error': 'Invalid username or password'}), 401
    
    user_data = users[username]
    
    if not verify_password(password, user_data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    access_token = create_access_token(
        data={
            "sub": username,
            "role": user_data.get("role", "analyst"),
            "company": user_data.get("company")
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": username,
            "name": user_data['name'],
            "role": user_data.get("role", "analyst"),
            "company": user_data.get("company")
        }
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info"""
    username = current_user['sub']
    users = config['credentials']['usernames']
    
    if username not in users:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = users[username]
    return jsonify({
        "username": username,
        "name": user_data['name'],
        "role": user_data.get("role", "analyst"),
        "company": user_data.get("company")
    }), 200

# ============================================================================
# ROUTES - PDF Upload
# ============================================================================

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_pdf(current_user):
    """Upload and process PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files allowed'}), 400
    
    try:
        markdown_text, file_path = extract_text_from_pdf(file)
        
        word_count = len(markdown_text.split())
        
        if not markdown_text or word_count < 50:
            return jsonify({'error': 'PDF could not be parsed'}), 400
        
        save_to_vector_db(markdown_text, metadata={
            "source": "pdf_from_user",
            "role": current_user.get("role", "analyst"),
            "user": current_user["sub"],
            "filename": file.filename
        })
        
        preview = markdown_text[:500] + "..." if len(markdown_text) > 500 else markdown_text
        
        return jsonify({
            "success": True,
            "message": f"Successfully processed {file.filename}",
            "word_count": word_count,
            "file_path": file_path,
            "markdown_preview": preview
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

# ============================================================================
# ROUTES - Dashboard
# ============================================================================

@app.route('/api/dashboard/data', methods=['POST'])
@token_required
def get_dashboard_data(current_user):
    """Get dashboard data"""
    data = request.get_json()
    role = data.get('role', current_user.get('role'))
    company = data.get('company', current_user.get('company'))
    query = data.get('query', 'summary')
    
    try:
        if role == "ceo" and company:
            chunks = find_relevant_chunks(query, role="ceo", company=company)
        elif role == "inventory_manager":
            chunks = find_relevant_chunks(query, role="inventory_manager")
        elif role == "owner":
            chunks = find_relevant_chunks(query, role="owner")
        else:
            chunks = find_relevant_chunks(query, role="analyst")
        
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
        
        return jsonify({
            "success": True,
            "tables": tables,
            "count": len(tables)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error fetching data: {str(e)}'}), 500

# ============================================================================
# ROUTES - Chat
# ============================================================================

@app.route('/api/chat', methods=['POST'])
@token_required
def chat(current_user):
    """Chat endpoint"""
    data = request.get_json()
    query = data.get('query')
    role = data.get('role', current_user.get('role'))
    company = data.get('company', current_user.get('company'))
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        if role == "ceo" and company:
            context_chunks = find_relevant_chunks(query, role=role, company=company)
        else:
            context_chunks = find_relevant_chunks(query, role=role)
        
        context_text = "\n\n".join(context_chunks) if context_chunks else "No relevant context found."
        answer = chat_with_context(query, context_text)
        
        return jsonify({
            "answer": answer,
            "context_used": bool(context_chunks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Chat error: {str(e)}'}), 500

# ============================================================================
# ROUTES - Health
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}), 200

@app.route('/api/info', methods=['GET'])
def api_info():
    return jsonify({
        "name": "Balance Sheet GPT API",
        "version": "1.0.0",
        "framework": "Flask"
    }), 200

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)