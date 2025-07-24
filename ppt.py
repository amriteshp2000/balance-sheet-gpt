from sentence_transformers import SentenceTransformer

try:
    embedder = SentenceTransformer('./model_cache/all-MiniLM-L6-v2', device='cpu')
    print("Embedder model loaded successfully.")
except Exception as e:
    print(f"Failed to load embedder model: {e}")
    embedder = None
if embedder is not None:
    print("Model loaded. Modules:", embedder._modules.keys())

