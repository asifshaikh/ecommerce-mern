import Product from '../models/product.model.js';
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.json('Error in addToCart controller', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.body;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.json('Error in removeFromCart controller', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const user = req.user;
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        res.json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.json('Product not found in cart');
    }
  } catch (error) {
    res.json('Error in updateQuantity controller', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find((item) => item.id === product.id);
      return { ...product, quantity: item.quantity };
    });
    res.json(cartItems);
  } catch (error) {
    console.log('Error in getCartProducts: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};