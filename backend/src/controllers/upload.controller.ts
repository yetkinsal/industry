import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import path from 'path';

const uploadService = new UploadService();

export class UploadController {
  /**
   * POST /api/uploads
   * Upload a file (.sql or .bak)
   */
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'No file uploaded'
        });
      }

      const { factoryId } = req.body;

      if (!factoryId) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required field: factoryId'
        });
      }

      const file = req.file;
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileType = fileExt === '.sql' ? 'sql' : 'bak';

      // Validate file type
      if (!uploadService.validateFileType(file.originalname, ['.sql', '.bak'])) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Only .sql and .bak files are allowed'
        });
      }

      // Save file metadata to database
      const uploadedFile = await uploadService.saveFileMetadata({
        factoryId,
        fileName: file.originalname,
        fileType,
        filePath: file.path,
        fileSize: file.size,
        metadata: {
          mimetype: file.mimetype,
          encoding: file.encoding,
        },
      });

      res.status(201).json(uploadedFile);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/uploads?factoryId=xxx
   * Get all uploaded files for a factory
   */
  async getUploadedFiles(req: Request, res: Response) {
    try {
      const factoryId = req.query.factoryId as string;

      if (!factoryId) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required parameter: factoryId'
        });
      }

      const files = await uploadService.getFilesByFactoryId(factoryId);
      res.json(files);
    } catch (error: any) {
      console.error('Error fetching uploaded files:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/uploads/:id
   * Get uploaded file details
   */
  async getUploadedFileById(req: Request, res: Response) {
    try {
      const file = await uploadService.getFileById(req.params.id);

      if (!file) {
        return res.status(404).json({
          error: 'Not found',
          message: 'File not found'
        });
      }

      res.json(file);
    } catch (error: any) {
      console.error('Error fetching uploaded file:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/uploads/:id/content
   * Get file content (for SQL files)
   */
  async getFileContent(req: Request, res: Response) {
    try {
      const file = await uploadService.getFileById(req.params.id);

      if (!file) {
        return res.status(404).json({
          error: 'Not found',
          message: 'File not found'
        });
      }

      if (file.fileType !== 'sql') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Content can only be retrieved for SQL files'
        });
      }

      const content = await uploadService.getFileContent(file.filePath);
      res.json({ content, fileName: file.fileName });
    } catch (error: any) {
      console.error('Error fetching file content:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * DELETE /api/uploads/:id
   * Delete uploaded file
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const deleted = await uploadService.deleteFile(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Not found',
          message: 'File not found'
        });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
