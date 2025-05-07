// src/types/syncTypes.ts

export interface SyncOperation {
    type: 'create' | 'delete' | 'update' | 'patch';
    payload: any;
  }
  
  export interface SyncRequest {
    operations: SyncOperation[];
  }
  