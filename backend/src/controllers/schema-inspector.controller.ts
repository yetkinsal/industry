import { Request, Response } from 'express';
import { SchemaInspectorService } from '../services/schema-inspector.service';

const schemaInspector = new SchemaInspectorService();

export class SchemaInspectorController {
  /**
   * GET /api/schema/:connectionId/tables
   * Get all tables for a connection
   */
  async getTables(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const tables = await schemaInspector.getTables(connectionId);
      res.json(tables);
    } catch (error: any) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/schema/:connectionId/tables/:schemaName/:tableName/columns
   * Get columns for a specific table
   */
  async getTableColumns(req: Request, res: Response) {
    try {
      const { connectionId, schemaName, tableName } = req.params;
      const columns = await schemaInspector.getTableColumns(connectionId, schemaName, tableName);
      res.json(columns);
    } catch (error: any) {
      console.error('Error fetching table columns:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/schema/:connectionId/full
   * Get full schema structure
   */
  async getFullSchema(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const schema = await schemaInspector.getFullSchema(connectionId);

      // Convert Map to object for JSON serialization
      const tableDetailsObj: any = {};
      schema.tableDetails.forEach((value, key) => {
        tableDetailsObj[key] = value;
      });

      res.json({
        tables: schema.tables,
        tableDetails: tableDetailsObj,
      });
    } catch (error: any) {
      console.error('Error fetching full schema:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/schema/:connectionId/tables/:schemaName/:tableName/preview
   * Preview table data
   */
  async previewTableData(req: Request, res: Response) {
    try {
      const { connectionId, schemaName, tableName } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const data = await schemaInspector.previewTableData(connectionId, schemaName, tableName, limit);
      res.json(data);
    } catch (error: any) {
      console.error('Error previewing table data:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/schema/:connectionId/relationships
   * Get foreign key relationships
   */
  async getRelationships(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const relationships = await schemaInspector.getRelationships(connectionId);
      res.json(relationships);
    } catch (error: any) {
      console.error('Error fetching relationships:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
