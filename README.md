# **Localized Secure LLM with IPFS – RAG Chatbot**  

## **Overview**  
This project is a **secure, localized Retrieval-Augmented Generation (RAG) chatbot** that integrates **LLMs with document-based Q&A capabilities**. It supports **on-device model inference** and utilizes **IPFS (InterPlanetary File System)** for **decentralized storage**.  

Unlike traditional cloud-based AI solutions, this chatbot **runs locally**, providing **enhanced security, privacy, and accessibility** even in **offline or remote environments**.  

---

## **Key Features**  
✅ **On-Device LLM Inference** – Uses local models like **Phi-2, Mistral-7B, and Llama** for **fast, secure, and private** responses.  
✅ **Retrieval-Augmented Generation (RAG)** – Retrieves **document snippets** for **context-aware** answers.  
✅ **Decentralized Storage with IPFS** – Ensures **tamper-proof, secure storage** without relying on centralized servers.  
✅ **Efficient Embeddings & FAISS Indexing** – Uses **HuggingFace sentence embeddings** and **FAISS** for **high-speed** semantic search.  
✅ **Smart Caching with DiskCache** – Reduces redundant LLM calls, improving response speed.  
✅ **Fully Local & Offline Support** – Can be **deployed in remote areas** without **internet connectivity**.  
✅ **Interactive UI with Streamlit** – A simple, user-friendly chat interface.  

---

## **How It Works**  

### **1. Secure Document Processing**  
- Users **upload a TXT or PDF document**.  
- The document is **chunked** into smaller sections for **efficient retrieval**.  
- **Sentence embeddings** are generated and stored in a **FAISS index**.  

### **2. Retrieval-Augmented Generation (RAG) Pipeline**  
- When a user **asks a question**, **semantic search** retrieves relevant document chunks.  
- The **retrieved context** is **fed into the LLM** to generate an **accurate** answer.  

### **3. Secure & Localized Response Generation**  
- All processing happens **on-device** for **maximum security**.  
- **Cached results** improve **speed** and **efficiency**.  
- If enabled, documents can be stored in **IPFS** for **decentralized access**.  

---

## **Advantages & Selling Points**  

🔐 **100% Private & Secure** – No external API calls; all processing is **done locally**.  
🌍 **Works in Remote Areas** – Can be deployed **without an internet connection**.  
⚡ **Fast & Efficient** – Uses **FAISS indexing and smart caching** for near-instant retrieval.  
🛠️ **Fully Customizable & Extendable** – Supports **model fine-tuning** and **secure parameter adjustments**.  
🛡️ **Tamper-Proof Document Storage** – Uses **IPFS** to prevent unauthorized alterations.  
🚀 **Scalable Multi-LLM Support** – Dynamically switch between **Mistral, Phi-2, Llama**, and more.  
🔗 **Web3 Integration Ready** – Can **integrate with smart contracts** for secure model management.  

---

## **Tech Stack**  

### **Backend**  
- **Python** – Core backend logic  
- **LangChain** – Text processing and embeddings  
- **LlamaCpp** – On-device LLM inference  
- **FAISS** – Vector search for fast document retrieval  
- **HuggingFace Embeddings** – Semantic similarity search  
- **DiskCache** – Persistent response caching  

### **Frontend**  
- **Streamlit** – Interactive chatbot UI  

### **Storage & Security**  
- **IPFS** – Decentralized document storage  
- **Tempfile & OS** – Secure temporary file handling  
- **Pickle & FAISS Storage** – Local index persistence  

---

## **Future Enhancements**  

🚀 **Multi-LLM Support** – Dynamically switch between models like **Mistral, Phi-2, or Llama**.  
🔐 **End-to-End Encryption** – Secure document retrieval & storage.  
🌎 **Web3 Integration** – Use **smart contracts for model ownership tracking**.  
📈 **Advanced Hybrid Retrieval** – Combining **BM25 + embeddings** for better context matching.  

---

## **Contributors**  
**Debayan Ghosh** 
**Soumyadeep Basak ** 
**Shubham Sahu** 
---

This project ensures **full privacy, security, and offline functionality** by running **LLMs locally** and storing documents in **a decentralized manner using IPFS.** 🚀  
