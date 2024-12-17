import stripe from '../libs/stripe.js';
import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js';

import dotenv from 'dotenv';

dotenv.config();
export const createCheckoutsession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: 'Invalid products or empty products array' });
    }
    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
      };
    });
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        userId: req.user._id,
      });
      if (coupon) {
        totalAmount = Math.round(
          totalAmount * (coupon.discountPercentage / 100)
        );
      }
    }
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || '',
        products: JSON.stringify(
          products.map(
            (p = {
              id: p._id,
              quantity: p.quantity,
              price: p.price,
            })
          )
        ),
      },
    });
    if (totalAmount >= 20000) {
      const newCoupon = await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error('error in createCheckoutsession', error);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        );
      }
      //create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: session.id,
      });
      await newOrder.save();
      res.status(200).json({
        message: 'Payment Successfull ,Order created successfully',
        success: true,
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.log('Error in checkout-success: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: 'once',
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: 'GIFT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await newCoupon.save();
  return newCoupon;
}
