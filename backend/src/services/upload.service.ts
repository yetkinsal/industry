import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { appDbPool } from '../config/database';

const unlinkAsync = promisify(fs.unlink);

export interface UploadedFile {
  id: string;
  factoryId: string;
  fileName: string;
  fileType: 'sql' | 'bak';
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  metadata?: any;
}

export class UploadService {
  /**
   * Save uploaded file metadata to database
   */
  async saveFileMetadata(data: {
    factoryId: string;
    fileName: string;
    fileType: 'sql' | 'bak';
    filePath: string;
    fileSize: number;
    metadata?: any;
  }): Promise<UploadedFile> {
    const query = `
      INSERT INTO uploaded_files (factory_id, file_name, file_type, file_path, file_size, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        factory_id as "factoryId",
        file_name as "fileName",
        file_type as "fileType",
        file_path as "filePath",
        file_size as "fileSize",
        status,
        metadata,
        created_at as "uploadedAt"
    `;

    const result = await appDbPool.query(query, [
      data.factoryId,
      data.fileName,
      data.fileType,
      data.filePath,
      data.fileSize,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]);

    return result.rows[0];
  }

  /**
   * Get all uploaded files for a factory
   */
  async getFilesByFactoryId(factoryId: string): Promise<UploadedFile[]> {
    const query = `
      SELECT
        id,
        factory_id as "factoryId",
        file_name as "fileName",
        file_type as "fileType",
        file_path as "filePath",
        file_size as "fileSize",
        status,
        metadata,
        created_at as "uploadedAt"
      FROM uploaded_files
      WHERE factory_id = $1
      ORDER BY created_at DESC
    `;

    const result = await appDbPool.query(query, [factoryId]);
    return result.rows;
  }

  /**
   * Get uploaded file by ID
   */
  async getFileById(id: string): Promise<UploadedFile | null> {
    const query = `
      SELECT
        id,
        factory_id as "factoryId",
        file_name as "fileName",
        file_type as "fileType",
        file_path as "filePath",
        file_size as "fileSize",
        status,
        metadata,
        created_at as "uploadedAt"
      FROM uploaded_files
      WHERE id = $1
    `;

    const result = await appDbPool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update file status
   */
  async updateFileStatus(
    id: string,
    status: 'uploaded' | 'processing' | 'processed' | 'failed',
    metadata?: any
  ): Promise<void> {
    const query = `
      UPDATE uploaded_files
      SET status = $1, metadata = COALESCE($2, metadata), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;

    await appDbPool.query(query, [status, metadata ? JSON.stringify(metadata) : null, id]);
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(id: string): Promise<boolean> {
    const file = await this.getFileById(id);
    if (!file) return false;

    // Delete physical file
    try {
      if (fs.existsSync(file.filePath)) {
        await unlinkAsync(file.filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    // Delete from database
    const query = 'DELETE FROM uploaded_files WHERE id = $1';
    const result = await appDbPool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Validate file type
   */
  validateFileType(fileName: string, allowedExtensions: string[]): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * Get file content (for SQL files)
   */
  async getFileContent(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }
}
