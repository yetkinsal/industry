import { Request, Response } from 'express';
import { FactoriesService } from '../services/factories.service';

const factoriesService = new FactoriesService();

export class FactoriesController {
  /**
   * GET /api/factories
   */
  async getAllFactories(req: Request, res: Response) {
    try {
      const factories = await factoriesService.getAllFactories();
      res.json(factories);
    } catch (error: any) {
      console.error('Error fetching factories:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * GET /api/factories/:id
   */
  async getFactoryById(req: Request, res: Response) {
    try {
      const factory = await factoriesService.getFactoryById(req.params.id);
      if (!factory) {
        return res.status(404).json({ error: 'Not found', message: 'Factory not found' });
      }
      res.json(factory);
    } catch (error: any) {
      console.error('Error fetching factory:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * POST /api/factories
   */
  async createFactory(req: Request, res: Response) {
    try {
      const { name, location, timezone } = req.body;

      if (!name || !location || !timezone) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Missing required fields: name, location, timezone'
        });
      }

      const factory = await factoriesService.createFactory({ name, location, timezone });
      res.status(201).json(factory);
    } catch (error: any) {
      console.error('Error creating factory:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * PUT /api/factories/:id
   */
  async updateFactory(req: Request, res: Response) {
    try {
      const factory = await factoriesService.updateFactory(req.params.id, req.body);
      if (!factory) {
        return res.status(404).json({ error: 'Not found', message: 'Factory not found' });
      }
      res.json(factory);
    } catch (error: any) {
      console.error('Error updating factory:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * DELETE /api/factories/:id
   */
  async deleteFactory(req: Request, res: Response) {
    try {
      const deleted = await factoriesService.deleteFactory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Not found', message: 'Factory not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting factory:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
