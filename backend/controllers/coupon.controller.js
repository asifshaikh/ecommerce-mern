import Coupon from '../models/coupon.model.js';

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    console.log('Error in getCoupon: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code, isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    if (coupon.expirationDate < Date.now()) {
      coupon.isActive = false;
      await coupon.save();
      res.status(404).json({ message: 'Coupon expired' });
    }
    res.json({
      message: 'Coupon valid',
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    });
  } catch (error) {
    console.log('Error in validateCoupon: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
