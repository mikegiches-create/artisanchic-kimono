// backend/routes/products.js
import express from "express";
import Product from "../model/Product.js";
import { Op } from "sequelize";

const router = express.Router();

// ✅ GET /api/products -> return all products with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, inStock, minPrice, maxPrice, search } = req.query;
    
    // Build query filters
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      order: [['id', 'ASC']],
    });

    // Return empty array if no products found (don't return 404)
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to load products",
      error: err.message
    });
  }
});

// ✅ GET /api/products/:id -> return product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    // Return product directly for frontend compatibility
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to load product",
      error: err.message
    });
  }
});

// ✅ POST /api/products -> create a new product (admin only - add auth middleware later)
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (err) {
    console.error("❌ Error creating product:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to create product",
      error: err.message
    });
  }
});

// ✅ PUT /api/products/:id -> update a product (admin only - add auth middleware later)
router.put("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    await product.update(req.body);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (err) {
    console.error("❌ Error updating product:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to update product",
      error: err.message
    });
  }
});

// ✅ DELETE /api/products/:id -> delete a product (admin only - add auth middleware later)
router.delete("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid product ID" 
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete product",
      error: err.message
    });
  }
});

export default router;
