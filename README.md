# 🏥 Healthcare RAG Chatbot=

A production-ready, highly secure, and privacy-focused Retrieval-Augmented Generation (RAG) chatbot designed specifically for healthcare environments. 

This system allows medical professionals to upload hospital Standard Operating Procedures (SOPs), clinical guidelines, and policy documents (PDF/CSV) to a **completely local** knowledge base. The AI assistant strictly answers questions based on the uploaded context, resisting hallucinations and ensuring data privacy.

---

## ✨ Key Features

- **100% Local Execution:** No healthcare data ever leaves the local machine. Embeddings, vector storage, and LLM inference happen entirely on-device.
- **Hallucination Resistance:** Built with strict LangChain prompt engineering to ensure the AI only answers based on the uploaded SOPs. If the answer is not in the documents, the AI explicitly states it cannot find the information.
- **Premium User Interface:** A minimalist, highly professional Next.js frontend built with React, Tailwind CSS, Framer Motion, and `shadcn/ui`. Uses a universally trusted Royal Blue color palette.
- **Smart Document Processing:** Intelligent PDF parsing using `PyMuPDFLoader` and context-aware chunking to preserve paragraph structure.

---

## 🛠️ Technology Stack

**Backend (Python)**
- **Framework:** FastAPI
- **RAG Pipeline:** LangChain
- **Vector Database:** ChromaDB (Persistent local storage)
- **Embeddings:** HuggingFace `all-MiniLM-L6-v2` (Fast, CPU-friendly)
- **LLM Engine:** Ollama (Recommended: `llama3.2` 3B for 8GB RAM systems)

**Frontend (TypeScript)**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 & `shadcn/ui`
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🚀 Setup & Installation

### Prerequisites
1. **Python 3.10+**
2. **Node.js (LTS)**
3. **Ollama** installed on your system.

### 1. Backend Setup
Open a terminal in the root directory:
```bash
cd backend
python -m venv venv
# Activate the virtual environment
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
# Alternatively, install the main packages directly:
pip install fastapi uvicorn langchain langchain-ollama langchain-chroma langchain-huggingface chromadb pymupdf sentence-transformers python-multipart pydantic-settings
```

### 2. Frontend Setup
Open a new terminal in the root directory:
```bash
cd frontend
npm install
```

### 3. Model Setup (Ollama)
Open a terminal and pull the recommended 3B model (optimized for 8GB RAM):
```bash
ollama run llama3.2
```

---

## 💻 How to Run the Application

You need three terminal windows to run the application components simultaneously:

**Terminal 1: Start the Local LLM**
```bash
ollama run llama3.2
```

**Terminal 2: Start the FastAPI Backend**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*Backend API will be available at `http://localhost:8000`*

**Terminal 3: Start the Next.js Frontend**
```bash
cd frontend
npm run dev
```
*Frontend UI will be available at `http://localhost:3000`*

---

## 📁 Architecture & Folder Structure

```text
project_AI/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI routes (upload, chat)
│   │   ├── core/                # Configuration and settings
│   │   ├── services/            # RAG pipeline & ingestion logic
│   │   └── main.py              # Application entry point
│   ├── data/                    # Uploaded raw files
│   └── chroma_db/               # Persistent ChromaDB storage
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js App Router (page.tsx, layout.tsx)
    │   ├── components/          # Reusable UI (Chat, Sidebar, shadcn)
    │   └── lib/                 # Utilities
    └── tailwind.config.ts
```

---

## 🛡️ Security Considerations
Because this is built for a healthcare environment, **do not replace Ollama with cloud APIs (like OpenAI)** unless you have a Business Associate Agreement (BAA) and are strictly complying with HIPAA regulations. The current local setup guarantees complete data sovereignty.
