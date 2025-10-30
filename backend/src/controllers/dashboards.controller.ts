import { Request, Response } from 'express';
import { DashboardsService } from '../services/dashboards.service';
import { WidgetsService } from '../services/widgets.service';

const dashboardsService = new DashboardsService();
const widgetsService = new WidgetsService();

export class DashboardsController {
  /**
   * GET /api/dashboards?factoryId=xxx
   */
  async getAllDashboards(req: Request, res: Response) {
    try {
      const factoryId = req.query.factoryId as string | undefined;
      const dashboards = await dashboardsService.getAllDashboards(factoryId);
      res.json(dashboards);
    } catch (error: any) {
      console.error('Error fetching dashboards:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/dashboards/:id
   * Returns dashboard with all widgets
   */
  async getDashboardById(req: Request, res: Response) {
    try {
      const dashboard = await dashboardsService.getDashboardById(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Not found', message: 'Dashboard not found' });
      }

      // Get all widgets for this dashboard
      const widgets = await widgetsService.getWidgetsByDashboardId(req.params.id);

      res.json({
        ...dashboard,
        widgets,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/dashboards
   */
  async createDashboard(req: Request, res: Response) {
    try {
      const { factoryId, name, description, filters } = req.body;

      if (!factoryId || !name) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: factoryId, name'
        });
      }

      const dashboard = await dashboardsService.createDashboard({
        factoryId,
        name,
        description,
        filters,
      });

      res.status(201).json(dashboard);
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PUT /api/dashboards/:id
   */
  async updateDashboard(req: Request, res: Response) {
    try {
      const dashboard = await dashboardsService.updateDashboard(req.params.id, req.body);
      if (!dashboard) {
        return res.status(404).json({ error: 'Not found', message: 'Dashboard not found' });
      }
      res.json(dashboard);
    } catch (error: any) {
      console.error('Error updating dashboard:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PATCH /api/dashboards/:id/layout
   */
  async updateLayout(req: Request, res: Response) {
    try {
      const { layout } = req.body;

      if (!layout || !Array.isArray(layout)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid layout format'
        });
      }

      const dashboard = await dashboardsService.updateLayout(req.params.id, layout);
      if (!dashboard) {
        return res.status(404).json({ error: 'Not found', message: 'Dashboard not found' });
      }

      res.json(dashboard);
    } catch (error: any) {
      console.error('Error updating layout:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PATCH /api/dashboards/:id/filters
   */
  async updateFilters(req: Request, res: Response) {
    try {
      const { filters } = req.body;

      if (!filters) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid filters format'
        });
      }

      const dashboard = await dashboardsService.updateFilters(req.params.id, filters);
      if (!dashboard) {
        return res.status(404).json({ error: 'Not found', message: 'Dashboard not found' });
      }

      res.json(dashboard);
    } catch (error: any) {
      console.error('Error updating filters:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * DELETE /api/dashboards/:id
   */
  async deleteDashboard(req: Request, res: Response) {
    try {
      const deleted = await dashboardsService.deleteDashboard(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Not found', message: 'Dashboard not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting dashboard:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
