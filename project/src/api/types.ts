export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  address: string;
  token: string;
}

export interface DocumentProcessingResponse {
  documentId: string;
  status: 'processing' | 'completed' | 'failed';
  summary?: string;
  error?: string;
}

export interface ModelUploadResponse {
  modelId: string;
  ipfsHash: string;
  contractAddress: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  messages: ChatMessage[];
  context?: string;
}

export interface QueryResponse {
  answer: string;
}