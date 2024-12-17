import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';

import dotenv from 'dotenv';

import {
  checkoutSuccess,
  createCheckoutsession,
} from '../controllers/payment.controller.js';

dotenv.config();

const router = express.Router();

router.post('/create-checkout-session', protectedRoute, createCheckoutsession);
router.post('/checkout-success', protectedRoute, checkoutSuccess);

export default router;
