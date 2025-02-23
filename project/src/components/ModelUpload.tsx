import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Button } from './Button';

export const ModelUpload: React.FC = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload to IPFS here
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Upload Model</h2>
      
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <p className="text-gray-500">
            Drag 'n' drop your model files here, or click to select files
          </p>
        )}
      </div>
      
      <div className="mt-4">
        <Button className="w-full">Upload to Blockchain</Button>
      </div>
    </div>
  );
};