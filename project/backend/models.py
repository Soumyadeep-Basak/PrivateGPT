import os
import warnings
import numpy as np
import faiss
import diskcache as dc
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from llama_cpp import Llama
import time
from typing import List, Optional
import asyncio

warnings.filterwarnings("ignore", category=DeprecationWarning)

class DocumentProcessor:
    def __init__(self, model_path: str):
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.llm = Llama(
            model_path=model_path,
            verbose=False,
            n_ctx=2048,
            n_batch=32
        )
        self.index = None
        self.docs = []
        self.cache = dc.Cache("./llm_cache")

    async def process_file(self, file_path: str) -> List[str]:
        """Processes a file (PDF/TXT), extracts text, chunks it, and builds FAISS index."""
        file_ext = os.path.splitext(file_path)[-1].lower()
        
        if file_ext == ".txt":
            text_chunks = await self._process_text(file_path)
        elif file_ext == ".pdf":
            text_chunks = await self._process_pdf(file_path)
        else:
            raise ValueError("Unsupported file type!")
        
        await self._build_faiss_index(text_chunks)
        return text_chunks

    async def _process_text(self, file_path: str) -> List[str]:
        """Reads and splits a TXT file into chunks."""
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        return splitter.split_text(text)

    async def _process_pdf(self, file_path: str) -> List[str]:
        """Extracts text from a PDF file and splits it into chunks."""
        loader = PyMuPDFLoader(file_path)
        docs = loader.load()
        return [doc.page_content for doc in docs]

    async def _build_faiss_index(self, document_texts: List[str]):
        """Embeds document chunks and builds the FAISS index."""
        doc_vectors = self.embedding_model.embed_documents(document_texts)
        self.docs.extend(document_texts)

        if self.index is None:
            self.index = faiss.IndexFlatL2(len(doc_vectors[0]))
        self.index.add(np.array(doc_vectors))

    async def retrieve(self, query: str, k: int = 3) -> List[str]:
        """Finds the top-k relevant document chunks using FAISS."""
        if self.index is None:
            return ["No documents available."]

        query_vector = np.array(self.embedding_model.embed_query(query)).reshape(1, -1)
        distances, indices = self.index.search(query_vector, k)
        return [self.docs[i] for i in indices[0] if i < len(self.docs)]

    async def generate_answer(self, query: str) -> str:
        """Generates an LLM response for a direct chatbot query (without RAG)."""
        if query in self.cache:
            return self.cache[query]

        response = ""
        for output in self.llm(
            query,
            max_tokens=200,
            stream=True
        ):
            word = output["choices"][0]["text"]
            response += word

        self.cache[query] = response
        return response

    async def rag_retrieve_and_generate(self, query: str) -> str:
        """Performs retrieval-augmented generation (RAG) by fetching relevant context and generating an LLM response."""
        if query in self.cache:
            return self.cache[query]

        # Retrieve relevant document chunks
        context = await self.retrieve(query)
        if not context or context == ["No documents available."]:
            return await self.generate_answer(query)  # Default to normal chatbot if no documents are found

        # Construct the prompt with retrieved context
        prompt = f"Context: {context}\n\nQuestion: {query}\nAnswer:"
        
        prompt_tokens = len(prompt.split())
        max_allowed_tokens = 8192 - prompt_tokens
        if max_allowed_tokens <= 0:
            return "Error: Context too long. Reduce retrieved chunks."

        # Generate response using LLM
        response = ""
        for output in self.llm(
            prompt,
            max_tokens=min(200, max_allowed_tokens),
            stream=True
        ):
            word = output["choices"][0]["text"]
            response += word

        self.cache[query] = response
        return response
