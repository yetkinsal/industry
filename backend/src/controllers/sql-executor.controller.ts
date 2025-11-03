import { Request, Response } from 'express';
import { SqlExecutorService } from '../services/sql-executor.service';
import { UploadService } from '../services/upload.service';

const sqlExecutor = new SqlExecutorService();
const uploadService = new UploadService();

export class SqlExecutorController {
  /**
   * POST /api/sql/execute
   * Execute a single SQL query
   */
  async executeQuery(req: Request, res: Response) {
    try {
      const { connectionId, query } = req.body;

      if (!connectionId || !query) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: connectionId, query'
        });
      }

      const result = await sqlExecutor.executeQuery(connectionId, query);
      res.json(result);
    } catch (error: any) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/sql/execute-file/:fileId
   * Execute SQL file
   */
  async executeSqlFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const { connectionId } = req.body;

      if (!connectionId) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required field: connectionId'
        });
      }

      // Get file
      const file = await uploadService.getFileById(fileId);
      if (!file) {
        return res.status(404).json({
          error: 'Not found',
          message: 'File not found'
        });
      }

      if (file.fileType !== 'sql') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Only SQL files can be executed'
        });
      }

      // Update file status
      await uploadService.updateFileStatus(fileId, 'processing');

      // Get file content
      const content = await uploadService.getFileContent(file.filePath);

      // Execute SQL file
      const result = await sqlExecutor.executeSqlFile(connectionId, content);

      // Update file status
      await uploadService.updateFileStatus(
        fileId,
        result.failureCount === 0 ? 'processed' : 'failed',
        {
          executionResults: {
            totalQueries: result.totalQueries,
            successCount: result.successCount,
            failureCount: result.failureCount,
            executedAt: new Date().toISOString(),
          }
        }
      );

      res.json(result);
    } catch (error: any) {
      console.error('Error executing SQL file:', error);

      // Update file status to failed
      if (req.params.fileId) {
        try {
          await uploadService.updateFileStatus(req.params.fileId, 'failed', {
            error: error.message
          });
        } catch (updateError) {
          console.error('Error updating file status:', updateError);
        }
      }

      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/sql/analyze
   * Analyze query and get visualization recommendations
   */
  async analyzeQuery(req: Request, res: Response) {
    try {
      const { connectionId, query } = req.body;

      if (!connectionId || !query) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: connectionId, query'
        });
      }

      const analysis = await sqlExecutor.analyzeQuery(query, connectionId);
      res.json(analysis);
    } catch (error: any) {
      console.error('Error analyzing query:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/sql/parse
   * Parse SQL file and return queries
   */
  async parseSqlFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      // Get file
      const file = await uploadService.getFileById(fileId);
      if (!file) {
        return res.status(404).json({
          error: 'Not found',
          message: 'File not found'
        });
      }

      if (file.fileType !== 'sql') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Only SQL files can be parsed'
        });
      }

      // Get file content
      const content = await uploadService.getFileContent(file.filePath);

      // Parse SQL file
      const queries = sqlExecutor.parseSqlFile(content);

      res.json({
        fileName: file.fileName,
        totalQueries: queries.length,
        queries,
      });
    } catch (error: any) {
      console.error('Error parsing SQL file:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
