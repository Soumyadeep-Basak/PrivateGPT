import { ApiResponse, AuthResponse, DocumentProcessingResponse, ModelUploadResponse, ChatResponse, QueryResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  try {
    const data: unknown = await response.json(); // Parse response safely
    console.log("API Response Data:", data); // Debugging log

    if (typeof data !== "object" || data === null) {
      throw new ApiError("Invalid response format");
    }

    if ("answer" in data) {
      return (data as { answer: T }).answer; // Return only the answer
    }

    throw new ApiError("Response does not contain an answer");
  } catch (error) {
    console.error("Error processing API response:", error);
    throw new ApiError("Failed to process response");
  }
}


export const api = {
  auth: {
    verifyWallet: async (address: string, signature: string): Promise<AuthResponse> => {
      // ⚠️ Endpoint NOT found in FastAPI backend
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });
      return handleResponse<AuthResponse>(response);
    },
  },

  documents: {
    upload: async (files: File[], token: string): Promise<DocumentProcessingResponse[]> => {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));

      const response = await fetch(`${API_BASE_URL}/process-file/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return handleResponse<DocumentProcessingResponse[]>(response);
    },

    getStatus: async (documentId: string, token: string): Promise<DocumentProcessingResponse> => {
      // ⚠️ Endpoint NOT found in FastAPI backend
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse<DocumentProcessingResponse>(response);
    },

    query: async (documentId: string, query: string, token: string): Promise<QueryResponse> => {
      const response = await fetch(`${API_BASE_URL}/generate-answer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }), // documentId not required in backend
      });
      return handleResponse<QueryResponse>(response);
    },
  },

  models: {
    upload: async (file: File, metadata: any, token: string): Promise<ModelUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${API_BASE_URL}/models/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return handleResponse<ModelUploadResponse>(response);
    },

    download: async (cid: string) => {
      const response = await fetch(`${API_BASE_URL}/models/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid }),
      });
      return handleResponse<{ message: string; file_path: string }>(response);
    },
  },

  chat: {
    sendMessage: async (message: string, context: string | null, token: string): Promise<ChatResponse> => {
      // ⚠️ Endpoint NOT found in FastAPI backend
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, context }),
      });
      return handleResponse<ChatResponse>(response);
    },
  },
};
