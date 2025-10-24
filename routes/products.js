// backend/routes/products.js
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getProducts = () => {
  try {
    const dataPath = path.join(__dirname, "../data/products.json");
    const fileContent = readFileSync(dataPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("❌ Error reading products.json:", err.message);
    return [];
  }
};

// ✅ GET /api/products -> return all products
router.get("/", (req, res) => {
  try {
    const products = getProducts();
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ message: "Failed to load products" });
  }
});

// ✅ GET /api/products/:id -> return product by ID
router.get("/:id", (req, res) => {
  try {
    const products = getProducts();
    const productId = parseInt(req.params.id, 10);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err.message);
    res.status(500).json({ message: "Failed to load product" });
  }
});

export default router;
