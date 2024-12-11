import express from 'express';
import { getAllProducts } from '../controllers/product.controller.js';
import { protectedRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectedRoute, adminRoute, getAllProducts);

export default router;