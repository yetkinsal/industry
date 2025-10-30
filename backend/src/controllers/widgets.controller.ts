import { Request, Response } from 'express';
import { WidgetsService } from '../services/widgets.service';

const widgetsService = new WidgetsService();

export class WidgetsController {
  /**
   * GET /api/dashboards/:dashboardId/widgets
   */
  async getWidgetsByDashboardId(req: Request, res: Response) {
    try {
      const widgets = await widgetsService.getWidgetsByDashboardId(req.params.dashboardId);
      res.json(widgets);
    } catch (error: any) {
      console.error('Error fetching widgets:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/widgets/:id
   */
  async getWidgetById(req: Request, res: Response) {
    try {
      const widget = await widgetsService.getWidgetById(req.params.id);
      if (!widget) {
        return res.status(404).json({ error: 'Not found', message: 'Widget not found' });
      }
      res.json(widget);
    } catch (error: any) {
      console.error('Error fetching widget:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/dashboards/:dashboardId/widgets
   */
  async createWidget(req: Request, res: Response) {
    try {
      const { type, title, description, connectionId, query, params, refreshInterval, vizOptions, layout } = req.body;

      if (!type || !title || !connectionId || !query) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: type, title, connectionId, query'
        });
      }

      const widget = await widgetsService.createWidget({
        dashboardId: req.params.dashboardId,
        type,
        title,
        description,
        connectionId,
        query,
        params,
        refreshInterval,
        vizOptions,
        layout,
      });

      res.status(201).json(widget);
    } catch (error: any) {
      console.error('Error creating widget:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PUT /api/widgets/:id
   */
  async updateWidget(req: Request, res: Response) {
    try {
      const widget = await widgetsService.updateWidget(req.params.id, req.body);
      if (!widget) {
        return res.status(404).json({ error: 'Not found', message: 'Widget not found' });
      }
      res.json(widget);
    } catch (error: any) {
      console.error('Error updating widget:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * DELETE /api/widgets/:id
   */
  async deleteWidget(req: Request, res: Response) {
    try {
      const deleted = await widgetsService.deleteWidget(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Not found', message: 'Widget not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting widget:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/widgets/:id/execute
   * Execute the widget's SQL query with provided filters
   */
  async executeWidget(req: Request, res: Response) {
    try {
      const filters = req.body.filters || {};
      const result = await widgetsService.executeWidget(req.params.id, { filters });
      res.json(result);
    } catch (error: any) {
      console.error('Error executing widget:', error);
      res.status(500).json({ error: 'Query execution failed', message: error.message });
    }
  }

  /**
   * POST /api/query/test
   * Test a SQL query without saving it
   */
  async testQuery(req: Request, res: Response) {
    try {
      const { connectionId, query, params } = req.body;

      if (!connectionId || !query) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: connectionId, query'
        });
      }

      const result = await widgetsService.testQuery(connectionId, query, params || {});
      res.json(result);
    } catch (error: any) {
      console.error('Error testing query:', error);
      res.status(500).json({ error: 'Query test failed', message: error.message });
    }
  }
}
