import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const uploadController = new UploadController();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB max file size (increased for large databases)
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.sql', '.bak'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .sql and .bak files are allowed'));
    }
  }
});

// Routes
router.post('/', upload.single('file'), uploadController.uploadFile.bind(uploadController));
router.get('/', uploadController.getUploadedFiles.bind(uploadController));
router.get('/:id', uploadController.getUploadedFileById.bind(uploadController));
router.get('/:id/content', uploadController.getFileContent.bind(uploadController));
router.delete('/:id', uploadController.deleteFile.bind(uploadController));

export default router;
