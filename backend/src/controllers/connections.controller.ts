import { Request, Response } from 'express';
import { ConnectionsService } from '../services/connections.service';

const connectionsService = new ConnectionsService();

export class ConnectionsController {
  /**
   * GET /api/connections?factoryId=xxx
   */
  async getAllConnections(req: Request, res: Response) {
    try {
      const factoryId = req.query.factoryId as string | undefined;
      const connections = await connectionsService.getAllConnections(factoryId);

      // Don't send encrypted credentials to frontend
      const sanitized = connections.map(conn => ({
        id: conn.id,
        factoryId: conn.factoryId,
        name: conn.name,
        dbType: conn.dbType,
        host: conn.host,
        port: conn.port,
        database: conn.database,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
      }));

      res.json(sanitized);
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/connections/:id
   */
  async getConnectionById(req: Request, res: Response) {
    try {
      const connection = await connectionsService.getConnectionById(req.params.id);
      if (!connection) {
        return res.status(404).json({ error: 'Not found', message: 'Connection not found' });
      }

      // Don't send encrypted credentials to frontend
      const sanitized = {
        id: connection.id,
        factoryId: connection.factoryId,
        name: connection.name,
        dbType: connection.dbType,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      };

      res.json(sanitized);
    } catch (error: any) {
      console.error('Error fetching connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/connections
   */
  async createConnection(req: Request, res: Response) {
    try {
      const { factoryId, name, dbType, host, port, database, username, password, options } = req.body;

      if (!factoryId || !name || !dbType || !host || !port || !database || !username || !password) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields'
        });
      }

      const connection = await connectionsService.createConnection({
        factoryId,
        name,
        dbType,
        host,
        port,
        database,
        username,
        password,
        options,
      });

      // Don't send encrypted credentials to frontend
      const sanitized = {
        id: connection.id,
        factoryId: connection.factoryId,
        name: connection.name,
        dbType: connection.dbType,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      };

      res.status(201).json(sanitized);
    } catch (error: any) {
      console.error('Error creating connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PUT /api/connections/:id
   */
  async updateConnection(req: Request, res: Response) {
    try {
      const connection = await connectionsService.updateConnection(req.params.id, req.body);
      if (!connection) {
        return res.status(404).json({ error: 'Not found', message: 'Connection not found' });
      }

      // Don't send encrypted credentials to frontend
      const sanitized = {
        id: connection.id,
        factoryId: connection.factoryId,
        name: connection.name,
        dbType: connection.dbType,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      };

      res.json(sanitized);
    } catch (error: any) {
      console.error('Error updating connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * DELETE /api/connections/:id
   */
  async deleteConnection(req: Request, res: Response) {
    try {
      const deleted = await connectionsService.deleteConnection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Not found', message: 'Connection not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/connections/test
   */
  async testConnection(req: Request, res: Response) {
    try {
      const { dbType, host, port, database, username, password } = req.body;

      if (!dbType || !host || !port || !database || !username || !password) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields'
        });
      }

      const result = await connectionsService.testConnection({
        dbType,
        host,
        port,
        database,
        username,
        password,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error testing connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/connections/:id/test
   */
  async testSavedConnection(req: Request, res: Response) {
    try {
      const result = await connectionsService.testSavedConnection(req.params.id);
      res.json(result);
    } catch (error: any) {
      console.error('Error testing saved connection:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
