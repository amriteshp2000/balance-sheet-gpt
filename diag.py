#!/usr/bin/env python3
"""
Complete Diagnosis Script
Checks everything and tells you exactly what's wrong
"""

import os
import sys
import json
import requests
print("\n" + "="*60)
print("🔬 BALANCE SHEET GPT - COMPLETE DIAGNOSIS")
print("="*60 + "\n")

issues = []
warnings = []

# 1. Check directory structure
print("1️  Checking directory structure...")

required = {
    'src': 'directory',
    'db': 'directory',  
    'backend': 'directory',
    'frontend': 'directory',
    'config.yaml': 'file'
}

for item, type_ in required.items():
    exists = os.path.exists(item)
    is_correct_type = (os.path.isdir(item) if type_ == 'directory' else os.path.isfile(item))
    
    if exists and is_correct_type:
        print(f"   ✅ {item}/")
    else:
        print(f"   ❌ {item}/ - MISSING!")
        issues.append(f"Missing {item}")

# 2. Check Python modules
print("\n2️⃣  Checking Python modules...")

modules_to_check = [
    ('src.pdf_parser_v1', 'extract_text_from_pdf'),
    ('src.chat_over_vector_db', 'find_relevant_chunks'),
    ('src.display', 'markdown_to_df')
]

for module_name, func_name in modules_to_check:
    try:
        module = __import__(module_name, fromlist=[func_name])
        func = getattr(module, func_name)
        print(f"   ✅ {module_name}.{func_name}")
    except Exception as e:
        print(f"   ❌ {module_name}.{func_name} - {e}")
        issues.append(f"Cannot import {module_name}")

# 3. Check database
print("\n3️⃣  Checking vector database...")

db_docs = "db/docs.jsonl"
db_index = "db/vector_index.faiss"

if os.path.exists(db_docs):
    with open(db_docs, 'r') as f:
        doc_count = sum(1 for _ in f)
    
    if doc_count > 0:
        print(f"   ✅ Database has {doc_count} documents")
    else:
        print(f"   ⚠️  Database exists but is EMPTY (0 documents)")
        warnings.append("Database is empty - upload a PDF")
else:
    print(f"   ❌ Database file not found: {db_docs}")
    issues.append("Database not initialized")

if os.path.exists(db_index):
    size = os.path.getsize(db_index) / 1024
    print(f"   ✅ FAISS index exists ({size:.1f} KB)")
else:
    print(f"   ⚠️  FAISS index not found (will be created)")
    warnings.append("FAISS index missing")

# 4. Check config.yaml
print("\n4️⃣  Checking config.yaml...")

if os.path.exists('config.yaml'):
    try:
        import yaml
        with open('config.yaml') as f:
            config = yaml.load(f, Loader=yaml.SafeLoader)
        
        users = config.get('credentials', {}).get('usernames', {})
        print(f"   ✅ Config loaded with {len(users)} users:")
        
        for username, data in users.items():
            role = data.get('role', 'unknown')
            print(f"      • {username} ({role})")
            
    except Exception as e:
        print(f"   ❌ Error loading config: {e}")
        issues.append("Config.yaml is invalid")
else:
    print(f"   ❌ config.yaml not found")
    issues.append("config.yaml missing")

# 5. Check environment variables
print("\n5️⃣  Checking environment variables...")

if 'MISTRAL_API_KEY' in os.environ:
    key = os.environ['MISTRAL_API_KEY']
    print(f"   ✅ MISTRAL_API_KEY set ({key[:10]}...)")
else:
    print(f"   ⚠️  MISTRAL_API_KEY not set")
    warnings.append("MISTRAL_API_KEY not set - chat won't work")

# 6. Check if backend is running
print("\n6️⃣  Checking if backend is running...")

try:
    
    response = requests.get('http://localhost:8000/api/health', timeout=2)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Backend is running")
        print(f"      Status: {data.get('status')}")
        print(f"      Database: {data.get('database', 'unknown')}")
    else:
        print(f"   ⚠️  Backend responded with status {response.status_code}")
        warnings.append("Backend may not be working correctly")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Backend is NOT running on port 8000")
    issues.append("Backend not running")
except Exception as e:
    print(f"   ❌ Error checking backend: {e}")
    warnings.append("Cannot check backend status")

# 7. Check if frontend is accessible
print("\n7️⃣  Checking if frontend is accessible...")

try:
    import requests
    response = requests.get('http://localhost:3000', timeout=2)
    if response.status_code == 200:
        print(f"   ✅ Frontend is running")
    else:
        print(f"   ⚠️  Frontend responded with status {response.status_code}")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Frontend is NOT running on port 3000")
    issues.append("Frontend not running")
except:
    print(f"   ⚠️  Cannot check frontend (may not be started yet)")

# ============================================================================
# FINAL REPORT
# ============================================================================

print("\n" + "="*60)
print("📋 DIAGNOSIS REPORT")
print("="*60 + "\n")

if not issues and not warnings:
    print("✅ ✅ ✅  EVERYTHING LOOKS GOOD! ✅ ✅ ✅\n")
    print("Your app should be working. If you still have issues:")
    print("  1. Check browser console (F12)")
    print("  2. Check backend.log for errors")
    print("  3. Make sure you're logged in")
    
elif issues:
    print("❌ CRITICAL ISSUES FOUND:\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
    
    print("\n🔧 HOW TO FIX:\n")
    
    if "Missing src" in str(issues):
        print("  → You're in the wrong directory!")
        print("    cd to your project root where src/ folder is\n")
    
    if "Cannot import" in str(issues):
        print("  → Python can't find your modules")
        print("    Run from project root: python backend/main_corrected.py\n")
    
    if "Database not initialized" in str(issues):
        print("  → Upload a PDF first:")
        print("    1. Run: streamlit run main.py")
        print("    2. Login and upload a PDF")
        print("    3. Then try React app\n")
    
    if "Backend not running" in str(issues):
        print("  → Start the backend:")
        print("    python backend/main_corrected.py\n")
    
    if "Frontend not running" in str(issues):
        print("  → Start the frontend:")
        print("    cd frontend && npm run dev\n")

elif warnings:
    print("⚠️  WARNINGS (not critical but should fix):\n")
    for i, warning in enumerate(warnings, 1):
        print(f"  {i}. {warning}")
    
    print("\n💡 SUGGESTIONS:\n")
    
    if "Database is empty" in str(warnings):
        print("  → Upload a PDF to see data in dashboard\n")
    
    if "MISTRAL_API_KEY" in str(warnings):
        print("  → Set API key: export MISTRAL_API_KEY='your-key'\n")

print("="*60 + "\n")

# Exit code
if issues:
    sys.exit(1)
else:
    sys.exit(0)