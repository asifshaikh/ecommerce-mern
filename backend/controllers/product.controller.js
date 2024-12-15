import Product from '../models/product.model.js';
import { redis } from '../libs/redis.js';
import cloudinary from '../libs/cloudinary.js';
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.log('Error in getAllProducts: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get('featured_products');
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    // if not in redis then fetch from mongodb
    // .lean is gonna return a plain javascript object instead of mongodb doc
    // which is good for performance
    featuredProducts = await Product.find({ featured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: 'No featured products found' });
    }
    await redis.set('featured_products', JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log('Error in getFeaturedProducts: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      await cloudinary.uploader.upload(image, { folder: products });
    }
    const product = new Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : '',
      category,
    });
    res.status(200).json(product);
  } catch (error) {
    console.log('Error in createProduct: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // delete product from cloudinary
    if (product.image) {
      const publicId = product.image.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log('Product deleted from cloudinary');
      } catch (error) {
        console.log(
          'Error in deleting product from cloudinary: ',
          error.message
        );
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Error in deleteProduct: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log('Error in getRecommendedProducts: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    console.log('Error in getProductsByCategory: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const products = await Product.findById(req.params.id);
    if (products) {
      products.featured = !products.featured;
      const updatedProduct = await products.save();
      await updateFeaturedProductCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.log('Error in toggleFeaturedProduct: ', error.message);
    res.status(500).json({ error: error.message, message: 'Server Error' });
  }
};
async function updateFeaturedProductCache() {
  try {
    const featuredProduct = await Product.findOne({ featured: true });
    await redis.set('featured_product', JSON.stringify(featuredProduct));
  } catch (error) {
    console.log('error in update cache function');
  }
}
