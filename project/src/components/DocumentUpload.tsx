import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useDocumentStatus } from '../hooks/useDocumentStatus';

interface UploadedFile {
  file: File;
  id: string;
  status?: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export const DocumentUpload: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const { documents } = useDocumentStatus();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Automatically upload files on selection
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'uploading' as const,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);

    await processDocuments(newFiles); // Upload immediately
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    disabled: !isAuthenticated || isUploading,
  });

  const processDocuments = async (filesToUpload: UploadedFile[]) => {
    if (!token) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);

      // Create FormData and append files
      const formData = new FormData();
      filesToUpload.forEach(({ file }) => formData.append("files", file));

      console.log("Uploading files:", filesToUpload.map(f => f.file.name));

      // Send files to backend
      const response = await fetch('/your-api-endpoint', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (response.ok) {
        setUploadedFiles(prev =>
          prev.map(file => ({
            ...file,
            status: 'processing', // Assume processing starts
          }))
        );
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process documents');
    } finally {
      setIsUploading(false);
    }
  };

  // Update local state based on WebSocket updates
  useEffect(() => {
    setUploadedFiles(prev => 
      prev.map(file => {
        const update = documents[file.id];
        return update ? {
          ...file,
          status: update.status,
          error: update.error,
        } : file;
      })
    );
  }, [documents]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Document Upload</h2>
      <p className="text-gray-600 mb-4">
        Upload documents for RAG-based summarization and question answering.
        Supported formats: PDF, DOC, DOCX, TXT
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 
          !isAuthenticated || isUploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
          'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {!isAuthenticated ? (
          <p className="text-gray-500">Please connect your wallet to upload documents</p>
        ) : isUploading ? (
          <p className="text-blue-500">Uploading documents...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop your documents here...</p>
        ) : (
          <p className="text-gray-500">
            Drag 'n' drop your documents here, or click to select files
          </p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Uploaded Documents</h3>
          <div className="space-y-2">
            {uploadedFiles.map(({ file, id, status, error: fileError }) => (
              <div
                key={id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  {status && (
                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      status === 'completed' ? 'bg-green-100 text-green-700' :
                      status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {status}
                    </span>
                  )}
                  {fileError && (
                    <span className="text-xs text-red-600">{fileError}</span>
                  )}
                </div>
                <button
                  onClick={() => removeFile(id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
