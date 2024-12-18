import express from 'express';
import { adminRoute, protectedRoute } from '../middleware/auth.middleware.js';
import {
  getAnalyticsData,
  getDailySalesData,
} from '../controllers/analytic.controller.js';

const router = express.Router();

router.get('/', protectedRoute, adminRoute, async (req, res) => {
  try {
    const analyticData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({ analyticData, dailySalesData });
  } catch (error) {
    console.log('Error in getAnalyticsData: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
});

export default router;
