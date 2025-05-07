// frontend/src/components/FileList.tsx
import React from 'react';
import { FileMetadata } from '../types/fileTypes';

interface FileListProps {
  files: FileMetadata[];
  onDownload: (file: FileMetadata) => void;
  onDelete: (file: FileMetadata) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDownload, onDelete }) => {
  // Helper to format file sizes in KB, MB, etc.
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{file.originalName}</td>
                <td style={{ textAlign: 'center' }}>{file.mimeType}</td>
                <td style={{ textAlign: 'center' }}>{formatSize(file.size)}</td>
                <td style={{ textAlign: 'center' }}>
                  {new Date(file.uploadDate).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => onDownload(file)}>Download</button>
                  <button onClick={() => onDelete(file)} style={{ marginLeft: '5px' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;
