import express from 'express';
import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from '../controllers/product.controller.js';
import { protectedRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectedRoute, adminRoute, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/recommended', getRecommendedProducts);
router.post('/create', protectedRoute, adminRoute, createProduct);
router.patch('/:id', protectedRoute, adminRoute, toggleFeaturedProduct);
router.delete('/:id', protectedRoute, adminRoute, deleteProduct);

export default router;
