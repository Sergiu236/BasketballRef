// backend/src/controllers/fileController.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { FileMetadata } from '../models/File';

// In-memory array of files
const fileList: FileMetadata[] = [];

/**
 * fileController
 * Contains handlers for upload, list, download, delete
 */

// GET /list
export function listFiles(req: Request, res: Response) {
  try {
    // Just return the fileList array
    res.status(200).json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
}

// POST /upload
export function uploadFile(req: Request, res: Response) {
  try {
    // Multer places the file metadata in req.file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate some unique ID. Could use a library like uuid, or do your own
    const generatedId = Date.now().toString() + '-' + Math.floor(Math.random() * 1000);

    // Build a new file metadata object
    const newFile: FileMetadata = {
      id: generatedId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      filePath: req.file.path  // e.g. "uploads/<filename>"
    };

    // Store in the array
    fileList.push(newFile);

    // Return metadata to client
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}

// GET /download/:id
export function downloadFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = fileList.find((f) => f.id === id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Option 1: If you want to force download:
    return res.download(file.filePath, file.originalName);

    // Option 2: If you want to open in browser if possible:
    // return res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}

// DELETE /:id
export function deleteFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = fileList.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove from array
    const [removedFile] = fileList.splice(index, 1);

    // Also delete from disk
    try {
      fs.unlinkSync(path.resolve(removedFile.filePath));
    } catch (fsErr) {
      console.error('Could not delete file from disk:', fsErr);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}
