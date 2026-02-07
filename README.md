# 🧠 Balance Sheet GPT

**Balance Sheet GPT** is a production-ready, scalable financial analysis platform that combines intelligent document processing, semantic search, and role-based access control. Built with FastAPI, React, and Pinecone, it enables teams to upload financial PDFs, extract data automatically, and get AI-powered insights through an interactive chat interface.

## 🌟 What's New in v2.0

- ✅ **Scalable Cloud Architecture**: Migrated from local FAISS to Pinecone serverless vector database
- ✅ **Modern React Frontend**: Beautiful, responsive UI with real-time chat overlay
- ✅ **FastAPI Backend**: High-performance REST API with async support
- ✅ **Auto-Loading Dashboard**: Data loads instantly after login
- ✅ **Role Assignment System**: Analysts can assign uploaded documents to specific roles
- ✅ **Production-Ready**: Designed for deployment with proper authentication and error handling

## 🚀 Key Features

### 🔐 Security & Access Control
- **JWT-Based Authentication**: Secure token-based sessions
- **Role-Based Data Filtering**: Users only see data relevant to their role
- **Company-Level Isolation**: Multi-tenant architecture for enterprise use
- **Bcrypt Password Hashing**: Industry-standard credential protection

### 📤 Intelligent Document Processing
- **Automatic PDF Parsing**: Extracts tables and text from financial reports using Mistral OCR
- **Large File Support**: Handles documents over 30 pages with automatic chunking
- **Smart Table Detection**: Preserves financial statement structure
- **Metadata Tagging**: Automatic role, company, and timestamp assignment

### 🔍 Advanced Search & Retrieval
- **Semantic Search**: Pinecone-powered vector similarity for natural language queries
- **Role-Filtered Queries**: Ensures data privacy across different user types
- **Top-K Retrieval**: Configurable result limits for optimal performance
- **Context-Aware Responses**: AI chat uses relevant financial data for accurate answers

### 🤖 AI-Powered Chat Interface
- **Interactive Overlay**: Floating chat window with minimize/maximize
- **Suggested Questions**: Quick-start prompts for common financial queries
- **Typing Indicators**: Real-time visual feedback
- **Context Citations**: Shows how many data points were used for each answer

### 📊 Modern Dashboard
- **Auto-Loading**: Data fetches automatically on login
- **Interactive Tables**: Hover effects and responsive grid layout
- **Real-Time Updates**: Refresh data without page reload
- **Beautiful Design**: Professional UI with smooth animations

## 🏗️ Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Vite + Tailwind/Custom CSS)       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │ │
│  │  │  Dashboard │  │    Chat    │  │  Role Assignment │   │ │
│  │  │ Component  │  │  Overlay   │  │      Modal       │   │ │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │ HTTPS/REST
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      API LAYER (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │    Authentication    │    Upload    │      Chat          │ │
│  │    - JWT Tokens      │   - OCR      │   - Mistral AI     │ │
│  │    - Role Validation │   - Parsing  │   - Context Fetch  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   VECTOR DATABASE        │  │   PROCESSING LAYER       │
│   (Pinecone Serverless)  │  │   - Mistral OCR          │
│   - 384D Embeddings      │  │   - PDF Chunking         │
│   - Role Filtering       │  │   - Table Extraction     │
│   - Semantic Search      │  │   - Deduplication        │
└──────────────────────────┘  └──────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with Hooks
- Vite for fast builds
- Lucide Icons for UI elements
- Custom CSS with modern design system
- Fetch API for HTTP requests

**Backend:**
- FastAPI (Python 3.10+)
- Uvicorn ASGI server
- PyJWT for authentication
- Python Multipart for file uploads
- CORS middleware for cross-origin requests

**AI & ML:**
- Mistral AI (OCR + Chat completion)
- Sentence Transformers (all-MiniLM-L6-v2)
- Pinecone serverless vector database
- PyMuPDF for PDF processing

**Infrastructure:**
- Pinecone cloud (AWS us-east-1)
- Docker-ready architecture
- Environment-based configuration

## 📂 Project Structure

```
balance-sheet-gpt/
│
├── backend/
│   ├── main_pinecone.py          # FastAPI server (v2.1)
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Main dashboard component
│   │   │   ├── Dashboard.css     # Styling with animations
│   │   │   ├── Login.jsx         # Authentication UI
│   │   │   ├── Login.css         # Login styling
│   │   │   └── RoleAssignment.jsx # Role assignment modal
│   │   ├── App.jsx               # Main app with routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── src/                          # Core Python modules
│   ├── pdf_parser_pinecone.py    # PDF processing + Pinecone storage
│   ├── display.py                # Data visualization utilities
│   └── generate_passwords.py    # User management tools
│
├── config.yaml                   # User credentials & roles
├── .env                          # API keys (not in git)
├── requirements.txt              # Global Python deps
└── README.md                     # This file
```

## 📋 System Requirements

### Minimum Requirements
- Python 3.10 or higher
- Node.js 18+ and npm/yarn
- 4GB RAM
- Internet connection (for Pinecone and Mistral APIs)

### API Keys Required
- **Pinecone API Key**: For vector database
- **Mistral API Key**: For OCR and chat completions
- **JWT Secret Key**: For session management

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/balance-sheet-gpt.git
cd balance-sheet-gpt
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv bgpt
source bgpt/bin/activate  # Windows: bgpt\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys:
# PINECONE_API_KEY=your_pinecone_key
# MISTRAL_API_KEY=your_mistral_key
# JWT_SECRET_KEY=your_secret_key
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install Lucide icons
npm install lucide-react
```

### 4. Generate User Accounts

```bash
python src/generate_passwords.py
```

This creates `config.yaml` with default user accounts and hashed passwords.

### 5. Initialize Pinecone Index

The Pinecone index is created automatically on first run. The backend will:
- Create index named `reliance-financial-data`
- Set dimension to 384 (for all-MiniLM-L6-v2)
- Use cosine similarity metric
- Deploy to AWS us-east-1 serverless

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python main_pinecone.py
# Server runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Production Mode

**Backend:**
```bash
cd backend
uvicorn main_pinecone:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

## 👥 User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **🔍 Analyst** | All Data + Upload | Upload PDFs, assign to roles, view all data, manage system |
| **👨‍💼 CEO** | Company-Specific | View financial data for assigned company only |
| **📦 Manager** | Department-Specific | Access data relevant to their department |
| **👑 Board Member** | Cross-Company | View aggregated data across business units |
| **🔒 Auditor** | Read-Only All | View all data but cannot modify |

## 📊 Default User Accounts

| Username | Password | Role | Company |
|----------|----------|------|---------|
| `analyst1` | `analystpass` | Analyst | All |
| `ceo_jio` | `ceojio123` | CEO | Jio Platforms |
| `ceo_retail` | `ceoretail123` | CEO | Reliance Retail |
| `manager1` | `manager123` | Manager | Reliance Industries |
| `board1` | `board123` | Board | All |

⚠️ **Change these passwords in production!**

## 🔧 Configuration

### User Management (`config.yaml`)

```yaml
credentials:
  usernames:
    analyst1:
      name: "Financial Analyst"
      email: "analyst@company.com"
      password: "$2b$12$..." # bcrypt hash
      role: "analyst"
      company: null  # Access to all companies
    
    ceo_jio:
      name: "Jio CEO"
      email: "ceo@jio.com"
      password: "$2b$12$..."
      role: "ceo"
      company: "Jio Platforms"
```

### API Configuration (`.env`)

```bash
# Pinecone
PINECONE_API_KEY=your-pinecone-api-key

# Mistral AI
MISTRAL_API_KEY=your-mistral-api-key

# Security
JWT_SECRET_KEY=your-long-random-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
PINECONE_INDEX_NAME=reliance-financial-data
EMBEDDING_DIMENSION=384
```

### Vector Database Settings

Modify in `src/pdf_parser_pinecone.py`:

```python
# Chunk size for documents
max_size = 1500  # characters per chunk

# Search parameters
top_k = 50      # Results for specific queries
top_k = 10000   # Results for dashboard "get all"
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login        # Login and get JWT token
GET    /api/auth/me           # Get current user info
```

### Document Management
```
POST   /api/upload            # Upload PDF (multipart/form-data)
GET    /api/roles             # Get available roles (analyst only)
POST   /api/assign-role       # Assign document to role
GET    /api/pending-documents # Get documents pending assignment
```

### Data & Chat
```
POST   /api/dashboard/data    # Get dashboard data (role-filtered)
POST   /api/chat              # Chat with AI about financial data
```

### System
```
GET    /api/health            # Health check + vector count
GET    /api/info              # API version and features
```

## 🎨 Frontend Components

### Dashboard Component
- Auto-loads data on mount using `useEffect`
- Displays financial tables in responsive grid
- Integrated chat overlay
- Upload modal with drag-and-drop
- Role assignment for analysts
- Real-time refresh

### Chat Overlay
- Floating window (bottom-right)
- Minimize/maximize functionality
- Suggested questions
- Typing indicator animation
- Context metadata display

### Login Component
- Modern gradient background
- Form validation
- Error messaging
- Session persistence

### Role Assignment Modal
- Dropdown with all available roles
- Visual selection feedback
- Skip/Cancel options

## 🧪 Testing

### Backend Tests

```bash
# Test API endpoints
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst1","password":"analystpass"}'

# Health check
curl http://localhost:8000/api/health
```

### Frontend Tests

```bash
# Run development server and check browser console
npm run dev

# Build production bundle
npm run build
```

## 🚢 Deployment

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "backend.main_pinecone:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./config.yaml:/app/config.yaml

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

### Cloud Deployment (AWS/GCP/Azure)

1. **Backend**: Deploy FastAPI to container service (ECS, Cloud Run, App Service)
2. **Frontend**: Host static build on CDN (CloudFront, Cloud CDN, Azure CDN)
3. **Environment**: Use secrets manager for API keys
4. **Domain**: Configure custom domain with SSL

## 🔒 Security Best Practices

### Production Checklist

- [ ] Change all default passwords in `config.yaml`
- [ ] Use strong JWT secret key (32+ characters)
- [ ] Enable HTTPS/TLS for all traffic
- [ ] Set `CORS` origins to your actual domain
- [ ] Store API keys in environment variables, never in code
- [ ] Implement rate limiting on API endpoints
- [ ] Enable audit logging for data access
- [ ] Regular security updates for dependencies

### Data Privacy

- User data is isolated by role and company filters
- JWT tokens expire after 24 hours (configurable)
- Passwords hashed with bcrypt (12 rounds)
- No sensitive data in client-side storage except tokens

## 🐛 Troubleshooting

### Common Issues

**"Pinecone connection failed"**
- Check API key in `.env`
- Verify internet connection
- Ensure Pinecone account is active

**"No data showing in dashboard"**
- Verify user has correct role in `config.yaml`
- Check that PDFs have been uploaded with matching role
- Use browser DevTools to inspect API responses

**"Chat not responding"**
- Check Mistral API key
- Verify backend server is running
- Look for errors in browser console and backend logs

**"Upload fails"**
- Ensure PDF is valid and not encrypted
- Check file size (very large files may timeout)
- Verify Mistral API has OCR quota remaining

## 📊 Performance Optimization

### Backend
- Use Pinecone serverless for auto-scaling
- Implement caching for frequent queries
- Batch vector upserts (100 at a time)
- Async/await for I/O operations

### Frontend
- Lazy load components with React.lazy
- Virtualize long table lists
- Debounce chat input
- Compress images and assets

### Database
- Monitor Pinecone index metrics
- Set appropriate `top_k` limits
- Use metadata filters before vector search
- Regular cleanup of outdated records

## 🛠️ Development

### Adding New Features

**New User Role:**
1. Add role to `config.yaml`
2. Update role filtering logic in `find_relevant_chunks()`
3. Add role to dropdown in frontend

**New Dashboard Widget:**
1. Create component in `frontend/src/components/`
2. Import and add to `Dashboard.jsx`
3. Fetch data using existing API or create new endpoint

**New API Endpoint:**
1. Define route in `backend/main_pinecone.py`
2. Add request/response models with Pydantic
3. Implement business logic
4. Update API documentation

## 📚 Documentation

- **API Docs**: Visit `http://localhost:8000/docs` for interactive Swagger UI
- **User Guide**: See `/docs/USER_GUIDE.md`
- **Deployment Guide**: See `/docs/DEPLOYMENT.md`
- **Architecture Details**: See `/docs/ARCHITECTURE.md`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **JavaScript**: Follow Airbnb style guide, use Prettier
- **Commits**: Use conventional commits (feat, fix, docs, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: 99smartleader@gmail.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/balance-sheet-gpt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/balance-sheet-gpt/discussions)

## 📈 Roadmap

### v2.1 (Current)
- ✅ Pinecone vector database integration
- ✅ React frontend with chat overlay
- ✅ Role assignment system
- ✅ Auto-loading dashboard

### v2.2 (Planned)
- [ ] Multi-file batch upload
- [ ] Export to Excel with formatting
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Audit trail and activity logs

### v3.0 (Future)
- [ ] Real-time collaboration
- [ ] Custom report builder
- [ ] Mobile app (React Native)
- [ ] Advanced data visualization
- [ ] Integration with accounting software

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library for building interfaces
- [Pinecone](https://www.pinecone.io/) - Managed vector database
- [Mistral AI](https://mistral.ai/) - AI models for OCR and chat
- [Sentence Transformers](https://www.sbert.net/) - State-of-the-art embeddings
- [Vite](https://vitejs.dev/) - Lightning-fast frontend tooling

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ by Amritesh Pandey**

*Transform your financial analysis workflow with AI-powered insights, scalable architecture, and modern web technologies.*

## 🔗 Links

- [Live Demo](https://balance-sheet-gpt.vercel.app) (if deployed)
- [Documentation](https://docs.balance-sheet-gpt.com) (if available)
- [Blog Post](https://medium.com/@amritesh/building-balance-sheet-gpt) (if written)
- [Video Tutorial](https://youtube.com/watch?v=...) (if created)

---

**Version 2.1.0** | Last Updated: February 2026