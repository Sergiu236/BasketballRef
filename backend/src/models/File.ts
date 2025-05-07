// backend/src/models/File.ts

export interface FileMetadata {
    id: string;              // unique ID (could be generated from Date.now() or uuid)
    originalName: string;    // original file name
    mimeType: string;        // MIME type
    size: number;            // file size in bytes
    uploadDate: Date;        // timestamp of upload
    filePath: string;        // local path or disk location
  }
  