from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import jwt
from datetime import datetime, timedelta
import asyncio
from pydantic import BaseModel
import json
import uuid
import os
import requests
from models import DocumentProcessor
from ipfs_uploader import upload_model_to_ipfs
from huggingface_hub import hf_hub_download

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key for JWT
SECRET_KEY = "your-secret-key"  # In production, use environment variable
ALGORITHM = "HS256"

# In-memory storage
processing_documents = {}
connected_clients = {}
document_processors = {}

# Initialize document processor with model path
def ensure_model_download(model_name="phi-2-Q4_K_M-GGUF", file_name="phi-2-q4_k_m.gguf", save_dir=".\models"):
    """
    Checks if the GGUF model file exists locally, if not, downloads it from Hugging Face.
    
    Args:
        model_name (str): Name of the Hugging Face repository.
        file_name (str): Name of the GGUF model file.
        save_dir (str): Directory to save the model.
    
    Returns:
        str: Path to the downloaded model file.
    """
    model_path = os.path.join(save_dir, file_name)
    print(model_path)
    if os.path.exists(model_path):
        return model_path

    os.makedirs(save_dir, exist_ok=True)

    try:
        model_path = hf_hub_download(
            repo_id=f"raghav0/{model_name}",
            filename=file_name,
            cache_dir=save_dir
        )
    except Exception as e:
        print(e)
        return None

    return model_path
model_file = ensure_model_download()
print(model_file)
doc_processor = DocumentProcessor(model_file)

class AuthPayload(BaseModel):
    address: str
    signature: str

class MessagePayload(BaseModel):
    message: str
    context: Optional[str] = None

class QueryPayload(BaseModel):
    query: str
    documentId: str

def create_token(address: str) -> str:
    expires = datetime.utcnow() + timedelta(days=1)
    return jwt.encode(
        {"sub": address, "exp": expires},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def ensure_model_download(model_name="phi-2-Q4_K_M-GGUF", file_name="phi-2.Q4_K_M.gguf", save_dir="./models"):
    """
    Checks if the GGUF model file exists locally, if not, downloads it from Hugging Face.
    
    Args:
        model_name (str): Name of the Hugging Face repository.
        file_name (str): Name of the GGUF model file.
        save_dir (str): Directory to save the model.
    
    Returns:
        str: Path to the downloaded model file.
    """
    model_path = os.path.join(save_dir, file_name)

    if os.path.exists(model_path):
        return model_path

    os.makedirs(save_dir, exist_ok=True)

    try:
        model_path = hf_hub_download(
            repo_id=f"raghav0/{model_name}",
            filename=file_name,
            cache_dir=save_dir
        )
    except Exception as e:
        return None

    return model_path


async def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def save_upload_file(upload_file: UploadFile) -> str:
    file_location = f"./uploads/{upload_file.filename}"
    os.makedirs("./uploads", exist_ok=True)
    
    with open(file_location, "wb+") as file_object:
        file_object.write(await upload_file.read())
    return file_location

@app.post("/models/upload")
async def upload_model(
    file: UploadFile = File(...),
    token: str = Depends(verify_token)
):
    try:
        file_path = await save_upload_file(file)
        cid = await upload_model_to_ipfs(file_path)
        return {"success": True, "ipfs_hash": cid}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/models/download")
def download_model(cid: str):
    """API endpoint to download a model from IPFS given a CID."""
    model_name = f"model_{cid}.bin"
    save_path = os.path.join("./models", model_name)
    os.makedirs("./models", exist_ok=True)
    
    try:
        saved_file = download_model_from_ipfs(cid, save_path)
        return {"message": "Download successful", "file_path": saved_file}
    except HTTPException as e:
        raise e

class QueryRequest(BaseModel):
    query: str  # This defines the correct structure

@app.post("/generate-answer/")
async def generate_answer(request:QueryRequest):
    """API endpoint to generate an answer based on a query."""
    answer = await doc_processor.generate_answer(request.query)
    return {"answer": answer}

@app.post("/process-file/")
async def process_file(file: UploadFile = File(...)):
    """API endpoint to process an uploaded file."""
    file_location = f"./uploads/{file.filename}"
    os.makedirs("./uploads", exist_ok=True)
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        text_chunks = await doc_processor.process_file(file_location)
        return {"message": "File processed successfully", "chunks": text_chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
