import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { DocumentProcessingResponse } from '../api/types';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function useDocumentStatus() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Record<string, DocumentProcessingResponse>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send authentication token
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status_update') {
        setDocuments(prev => ({
          ...prev,
          [data.documentId]: {
            documentId: data.documentId,
            status: data.status,
            summary: data.summary,
            error: data.error
          }
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token]);

  return { documents };
}