// backend/src/routes/fileRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile
} from '../controllers/fileController';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage; store files in "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure multer with limits for large files
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

const router = Router();

// GET /api/files/list
router.get('/list', listFiles);

// POST /api/files/upload
router.post('/upload', upload.single('file'), uploadFile);

// GET /api/files/download/:id
router.get('/download/:id', downloadFile);

// DELETE /api/files/:id
router.delete('/:id', deleteFile);

export default router;
