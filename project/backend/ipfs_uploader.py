import os
import requests
from fastapi import HTTPException

# Filebase IPFS Configuration
FILEBASE_API_KEY = os.getenv("FILEBASE_API_KEY")
FILEBASE_UPLOAD_URL = "https://api.filebase.io/v1/ipfs/upload"
HEADERS = {"Authorization": f"Bearer {FILEBASE_API_KEY}"}

async def upload_model_to_ipfs(file_path: str):
    """Uploads a model file to IPFS via Filebase."""
    try:
        with open(file_path, "rb") as file:
            files = {"file": file}
            response = requests.post(FILEBASE_UPLOAD_URL, headers=HEADERS, files=files)

        if response.status_code == 200:
            cid = response.json().get("cid")
            return cid
        else:
            raise Exception("Failed to upload to IPFS: " + response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
