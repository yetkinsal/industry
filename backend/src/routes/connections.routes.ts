import { Router } from 'express';
import { ConnectionsController } from '../controllers/connections.controller';

const router = Router();
const controller = new ConnectionsController();

router.get('/', controller.getAllConnections.bind(controller));
router.get('/:id', controller.getConnectionById.bind(controller));
router.post('/', controller.createConnection.bind(controller));
router.put('/:id', controller.updateConnection.bind(controller));
router.delete('/:id', controller.deleteConnection.bind(controller));
router.post('/test', controller.testConnection.bind(controller));
router.post('/:id/test', controller.testSavedConnection.bind(controller));

export default router;
