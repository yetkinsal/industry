import { Router } from 'express';
import { FactoriesController } from '../controllers/factories.controller';

const router = Router();
const controller = new FactoriesController();

router.get('/', controller.getAllFactories.bind(controller));
router.get('/:id', controller.getFactoryById.bind(controller));
router.post('/', controller.createFactory.bind(controller));
router.put('/:id', controller.updateFactory.bind(controller));
router.delete('/:id', controller.deleteFactory.bind(controller));

export default router;
