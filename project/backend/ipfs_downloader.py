import os
import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Filebase IPFS Gateway
FILEBASE_GATEWAY_URL = "https://ipfs.filebase.io/ipfs/"

def download_model_from_ipfs(cid: str, save_path: str):
    """Downloads a model file from IPFS via Filebase given a CID."""
    try:
        file_url = f"{FILEBASE_GATEWAY_URL}{cid}"
        response = requests.get(file_url, stream=True)
        
        if response.status_code == 200:
            with open(save_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            return save_path
        else:
            raise Exception("Failed to download from IPFS: " + response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
