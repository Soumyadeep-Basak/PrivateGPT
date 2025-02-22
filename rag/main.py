import os
import warnings
import numpy as np
import faiss
import diskcache as dc
import pickle
import time
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader  
from llama_cpp import Llama

warnings.filterwarnings("ignore", category=DeprecationWarning)

# Paths for cached FAISS index and document store
INDEX_PATH = "./faiss_index.bin"
DOCS_PATH = "./docs.pkl"

# DiskCache for storing chatbot responses
cache = dc.Cache("./llm_cache")

# Load default embedding model
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Available LLMs (Modify paths as needed)
LLM_MODELS = {
    "Phi-2": r"C:\Users\USER\OneDrive\Desktop\hack\rag\phi-2-q4_k_m.gguf",
    "Mistral-7B": r"C:\Users\USER\OneDrive\Desktop\hack\rag\gemma-2-2b-q4_k_m.gguf"
}

# Default model initialization
llm = Llama(model_path=LLM_MODELS["Phi-2"], verbose=False, n_ctx=2048, n_batch=32)

# FAISS index & document store
index = None
docs = []


def load_llm(model_name):
    """Dynamically load a different LLM model."""
    global llm
    if model_name in LLM_MODELS:
        llm = Llama(model_path=LLM_MODELS[model_name], verbose=False, n_ctx=2048, n_batch=32)


def process_text(file_path):
    """Process text files (.txt)"""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    return splitter.split_text(text)


def process_pdf(file_path):
    """Process PDFs (.pdf)"""
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()
    return [doc.page_content for doc in docs]


def build_faiss_index(document_texts):
    """Build FAISS index with document embeddings."""
    global index, docs

    doc_vectors = embedding_model.embed_documents(document_texts)
    docs.extend(document_texts)

    if index is None:
        index = faiss.IndexFlatL2(len(doc_vectors[0]))

    index.add(np.array(doc_vectors))

    # Save FAISS index and documents
    faiss.write_index(index, INDEX_PATH)
    with open(DOCS_PATH, "wb") as f:
        pickle.dump(docs, f)


def load_faiss_index():
    """Load FAISS index from disk if available."""
    global index, docs

    if os.path.exists(INDEX_PATH) and os.path.exists(DOCS_PATH):
        index = faiss.read_index(INDEX_PATH)
        with open(DOCS_PATH, "rb") as f:
            docs = pickle.load(f)
        return True
    return False


def retrieve(query, k=2):
    """Retrieve most relevant documents."""
    if index is None:
        return ["No documents available."]

    query_vector = np.array(embedding_model.embed_query(query)).reshape(1, -1)
    distances, indices = index.search(query_vector, k)
    retrieved_docs = [docs[i] for i in indices[0]]
    return retrieved_docs


def generate_response(prompt, model_name):
    """Generate chatbot response using LLM."""
    
    load_llm(model_name)

    if prompt in cache:
        return cache[prompt]  # Return cached response

    response = ""
    for output in llm(prompt, max_tokens=200, stream=True):
        response += output["choices"][0]["text"]

    cache[prompt] = response  # Store response in cache
    return response


def rag_retrieve_and_respond(file_path, query, model_name):
    """Retrieve relevant data and generate answer using RAG."""
    
    load_llm(model_name)

    if not os.path.exists(file_path):
        return "Error: File not found."

    file_ext = os.path.splitext(file_path)[-1].lower()
    if file_ext == ".txt":
        text_chunks = process_text(file_path)
    elif file_ext == ".pdf":
        text_chunks = process_pdf(file_path)
    else:
        return "Error: Unsupported file format."

    build_faiss_index(text_chunks)  # Update FAISS index

    context = retrieve(query)
    prompt = f"Context: {context}\n\nQuestion: {query}\nAnswer:"

    response = generate_response(prompt, model_name)
    return response

# print(rag_retrieve_and_respond("./data/a.txt","What is the topic of the attached document :","phi-2"))

