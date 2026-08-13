import { Router } from 'express';
import { HealthController } from '@/controllers/HealthController.js';
import { asyncHandler } from '@/utils/asyncHandler.js';

const router = Router();
const controller = new HealthController();

router.get('/', asyncHandler(async (req, res) => controller.check(req, res)));

export default router;
