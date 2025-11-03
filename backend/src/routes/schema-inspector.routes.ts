import { Router } from 'express';
import { SchemaInspectorController } from '../controllers/schema-inspector.controller';

const router = Router();
const controller = new SchemaInspectorController();

// Schema inspection routes
router.get('/:connectionId/tables', controller.getTables.bind(controller));
router.get('/:connectionId/tables/:schemaName/:tableName/columns', controller.getTableColumns.bind(controller));
router.get('/:connectionId/tables/:schemaName/:tableName/preview', controller.previewTableData.bind(controller));
router.get('/:connectionId/full', controller.getFullSchema.bind(controller));
router.get('/:connectionId/relationships', controller.getRelationships.bind(controller));

export default router;
