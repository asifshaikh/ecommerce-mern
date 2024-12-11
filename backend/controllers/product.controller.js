import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import jwt from 'jsonwebtoken';
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.log('Error in getAllProducts: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
