import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';

import dotenv from 'dotenv';

import {
  checkoutSuccess,
  createCheckoutSession,
} from '../controllers/payment.controller.js';

dotenv.config();

const router = express.Router();

router.post('/create-checkout-session', protectedRoute, createCheckoutSession);
router.post('/checkout-success', protectedRoute, checkoutSuccess);

export default router;
