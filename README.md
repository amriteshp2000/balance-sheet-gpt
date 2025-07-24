# 🧠 Balance Sheet GPT

**Balance Sheet GPT** is a comprehensive financial analysis dashboard built with Streamlit that enables intelligent document processing, semantic search, and role-based financial insights. Upload PDF financial reports, extract data automatically, and get contextual answers through an AI-powered chat interface.

## 🚀 Features

- **🔐 Role-Based Authentication**: Secure access for Analysts, CEOs, Inventory Managers, and Group Owners
- **📤 Intelligent PDF Processing**: Automatic table extraction and content parsing from financial documents
- **🔍 Semantic Search**: FAISS-powered vector database for finding relevant information quickly
- **🤖 AI Chat Assistant**: Natural language queries with contextual responses
- **📊 Interactive Dashboards**: Role-specific data visualization and analytics
- **📥 Data Export**: Download processed data in CSV and Markdown formats
- **🧹 Data Management**: Tools for cleaning and managing vector database

## 📋 System Requirements

- Python 3.8+
- Streamlit
- FAISS for vector search
- Pandas for data processing
- Required API keys (see configuration section)

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Streamlit     │    │   PDF Parser     │    │  Vector Store   │
│   Frontend      │◄──►│   & OCR          │◄──►│   (FAISS)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Authentication  │    │   AI Chat        │    │  Data Export    │
│ & Role System   │    │   Assistant      │    │  & Analytics    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📂 Project Structure

```
balance-sheet-gpt/
│
├── .streamlit/
│   └── secrets.toml              # API keys and secrets
├── db/
│   ├── docs.jsonl               # Document metadata
│   └── vector_index.faiss       # Vector embeddings
├── output/
│   └── *.pdf, *.md, *.csv       # Generated files
├── src/
│   ├── pdf_parser.py            # PDF processing module
│   ├── chat_over_vector_db.py   # Chat functionality
│   ├── display.py               # UI components
│   ├── viz.py                   # Data visualization
│   └── generate_passwords.py    # User management
├── tools/
│   ├── clean_vector_db.py       # Database maintenance
│   ├── load_initial_vectordb.py # Initial data loading
├── config.yaml                  # User configuration
├── main.py                      # Main application
├── requirements.txt             # Dependencies
└── README.md                    # This file
```

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/balance-sheet-gpt.git
cd balance-sheet-gpt
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure API Keys

Create `.streamlit/secrets.toml` with your API credentials:

```toml
MISTRAL_API_KEY = "your-mistral-api-key-here"
# Add other API keys as needed
```

### 5. Generate User Configuration

```bash
python src/generate_passwords.py
```

This creates `config.yaml` with user accounts and role permissions.

### 6. Initialize Vector Database

```bash
python tools/load_initial_vectordb.py
```

## 🚀 Running the Application

```bash
streamlit run main.py
```

The application will be available at `http://localhost:8501`

## 👥 User Roles & Access

| Role | Access Level | Capabilities |
|------|--------------|-------------|
| **🔍 Analyst** | Full Data Access | Upload documents, view all data, manage database |
| **👨‍💼 CEO** | Company-Specific | View financial summaries and reports for assigned company |
| **📦 Inventory Manager** | Inventory Data Only | Access inventory-related tables and analytics |
| **👑 Group Owner** | Cross-Company Access | View data across all business segments |

## 📊 Sample User Accounts

| Username | Password | Role | Company |
|----------|----------|------|---------|
| `analyst1` | `analystpass` | Analyst | All |
| `ceo_jio` | `ceojio123` | CEO | Jio Platforms |
| `ceo_retail` | `ceoretail123` | CEO | Reliance Retail Ventures |
| `inventory_mgr` | `inventory123` | Inventory Manager | Reliance Industries |
| `group_head` | `ambani123` | Group Owner | All |

## 🔧 Configuration

### User Management

Edit `config.yaml` to add or modify user accounts:

```yaml
credentials:
  usernames:
    analyst1:
      email: analyst@company.com
      name: Financial Analyst
      password: $2b$12$... # hashed password
    # Add more users...
```

### Vector Database Settings

Modify database parameters in the respective Python modules:

- **Chunk Size**: Adjust in `chunk_parser.py` (default: 500 tokens)
- **Embedding Model**: Configure in `chat_over_vector_db.py`
- **Search Results**: Modify top-k parameter for retrieval

## 🧹 Maintenance

### Clean Vector Database

Remove duplicate or similar records:

```bash
python tools/clean_vector_db.py
```

### Rebuild Vector Index

Completely rebuild the vector database:

```bash
python tools/load_initial_vectordb.py --rebuild
```

### Export Data

Use the dashboard export buttons or programmatically export:

```python
from src.display import export_to_csv
export_to_csv(dataframe, "output/financial_data.csv")
```

## 🌐 Deployment

### Streamlit Cloud

1. Push code to GitHub repository
2. Connect to Streamlit Cloud
3. Add secrets in the Streamlit Cloud dashboard
4. Deploy automatically

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8501

CMD ["streamlit", "run", "main.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

Build and run:

```bash
docker build -t balance-sheet-gpt .
docker run -p 8501:8501 balance-sheet-gpt
```

## 🔒 Security Considerations

- **API Keys**: Never commit secrets to version control
- **User Authentication**: Passwords are hashed using bcrypt
- **Role-Based Access**: Data filtering enforced at query level
- **Session Management**: JWT tokens for secure sessions

## 🛠️ Development

### Adding New Features

1. **New Roles**: Modify `config.yaml` and role filtering logic
2. **Additional Data Sources**: Extend `pdf_parser.py`
3. **Custom Visualizations**: Add charts in `viz.py`
4. **Enhanced Search**: Improve retrieval in `chat_over_vector_db.py`

### Testing

```bash
# Run unit tests (if implemented)
python -m pytest tests/

# Test specific modules
python -m pytest tests/test_pdf_parser.py
```

## 📝 Dependencies

Key dependencies include:

- `streamlit`: Web application framework
- `streamlit-authenticator`: User authentication
- `faiss-cpu`: Vector similarity search
- `pandas`: Data manipulation
- `sentence-transformers`: Text embeddings
- `plotly`: Interactive visualizations

See `requirements.txt` for complete list with versions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: 99smartleader@gmail.com
- **Issues**: Create an issue on GitHub
- **Documentation**: See `/docs` folder for detailed guides

## 🙏 Acknowledgments

- [Streamlit](https://streamlit.io/) for the amazing web framework
- [FAISS](https://github.com/facebookresearch/faiss) for efficient similarity search
- [Hugging Face](https://huggingface.co/) for transformer models
- [Streamlit Authenticator](https://github.com/mkhorasani/Streamlit-Authenticator) for authentication

---

**Made with ❤️ by Amritesh Pandey**

*Transform your financial analysis workflow with AI-powered insights and intelligent document processing.*