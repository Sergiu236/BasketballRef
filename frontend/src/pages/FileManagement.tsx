// frontend/src/pages/FileManagement.tsx
import React, { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { FileMetadata } from '../types/fileTypes';
import config from '../config';

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the file list on mount
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${config.API_URL}/api/files/list`);
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to load file list');
      }
      const data: FileMetadata[] = await resp.json();
      setFiles(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Called by FileUpload to add newly uploaded file to our list
  const handleUploadComplete = (uploadedFile: FileMetadata) => {
    setFiles((prev) => [uploadedFile, ...prev]);
    setError(null);
  };

  const handleError = (msg: string) => {
    setError(msg);
  };

  // Called by FileList when user clicks "Download"
  const handleDownload = (file: FileMetadata) => {
    window.open(`${config.API_URL}/api/files/download/${file.id}`, '_blank');
  };

  // Called by FileList when user clicks "Delete"
  const handleDelete = async (file: FileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete ${file.originalName}?`)) {
      return;
    }

    try {
      const resp = await fetch(`${config.API_URL}/api/files/${file.id}`, {
        method: 'DELETE'
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to delete file');
      }
      // Remove it from our list
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>File Management</h1>

      <FileUpload onUploadComplete={handleUploadComplete} onError={handleError} />

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading && <p>Loading files…</p>}

      <FileList files={files} onDownload={handleDownload} onDelete={handleDelete} />
    </div>
  );
};

export default FileManagement;
