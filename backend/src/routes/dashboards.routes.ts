import { Router } from 'express';
import { DashboardsController } from '../controllers/dashboards.controller';

const router = Router();
const controller = new DashboardsController();

router.get('/', controller.getAllDashboards.bind(controller));
router.get('/:id', controller.getDashboardById.bind(controller));
router.post('/', controller.createDashboard.bind(controller));
router.put('/:id', controller.updateDashboard.bind(controller));
router.patch('/:id/layout', controller.updateLayout.bind(controller));
router.patch('/:id/filters', controller.updateFilters.bind(controller));
router.delete('/:id', controller.deleteDashboard.bind(controller));

export default router;
