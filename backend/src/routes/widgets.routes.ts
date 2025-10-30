import { Router } from 'express';
import { WidgetsController } from '../controllers/widgets.controller';

const router = Router();
const controller = new WidgetsController();

// Test query endpoint
router.post('/test', controller.testQuery.bind(controller));

// Widget CRUD
router.get('/:id', controller.getWidgetById.bind(controller));
router.put('/:id', controller.updateWidget.bind(controller));
router.delete('/:id', controller.deleteWidget.bind(controller));

// Execute widget query
router.post('/:id/execute', controller.executeWidget.bind(controller));

export default router;
