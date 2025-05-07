// frontend/src/components/FileUpload.tsx
import React, { useState, useRef, DragEvent } from 'react';
import { FileUploadState } from '../types/fileTypes';
import config from '../config';

interface FileUploadProps {
  onUploadComplete: (result: any) => void; // callback once the file is successfully uploaded
  onError: (error: string) => void;        // callback for errors
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, onError }) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Optional drag-and-drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      await uploadFiles(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      await uploadFiles(files);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadFiles = async (files: FileList) => {
    setUploadState({ isUploading: true, progress: 0, error: undefined });

    // We'll just handle one file at a time for simplicity
    // Or do a loop if you want multiple file concurrency
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Basic file type validation example
      // if (!['image/png','image/jpeg'].includes(file.type)) { ... }

      // We'll do a standard 'fetch' upload (no real-time progress events)
      // If you want progress updates, you'd need XHR or an external library (e.g. axios with onUploadProgress)
      const formData = new FormData();
      formData.append('file', file);

      try {
        const resp = await fetch(`${config.API_URL}/api/files/upload`, {
          method: 'POST',
          body: formData
        });
        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err.error || 'Upload failed');
        }
        const result = await resp.json();
        onUploadComplete(result);
      } catch (err: any) {
        console.error('File upload error:', err);
        onError(err.message);
        setUploadState({ isUploading: false, progress: 0, error: err.message });
      }
    }

    setUploadState({ isUploading: false, progress: 100 });
  };

  return (
    <div
      style={{
        border: '2px dashed #aaa',
        borderRadius: '6px',
        padding: '20px',
        textAlign: 'center'
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <p>Drag & drop files here, or click below to select files:</p>

      <button type="button" onClick={triggerFileSelect}>
        Select File
      </button>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {uploadState.isUploading && (
        <div style={{ marginTop: '10px' }}>
          <p>Uploading…</p>
        </div>
      )}
      {uploadState.error && (
        <div style={{ color: 'red' }}>
          <p>{uploadState.error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
