import { Router } from 'express';
import { SqlExecutorController } from '../controllers/sql-executor.controller';

const router = Router();
const controller = new SqlExecutorController();

// SQL execution routes
router.post('/execute', controller.executeQuery.bind(controller));
router.post('/execute-file/:fileId', controller.executeSqlFile.bind(controller));
router.post('/analyze', controller.analyzeQuery.bind(controller));
router.get('/parse/:fileId', controller.parseSqlFile.bind(controller));

export default router;
