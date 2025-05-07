// frontend/src/types/fileTypes.ts

export interface FileMetadata {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadDate: string; // or Date, but from server you typically get a string
    filePath: string;
  }
  
  export interface FileUploadProgress {
    fileName: string;
    progress: number; // 0 to 100
  }
  
  export interface FileUploadState {
    isUploading: boolean;
    progress: number;
    error?: string;
  }
  
  