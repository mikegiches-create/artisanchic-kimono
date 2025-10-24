import express from "express";

const router = express.Router();

// Temporary in-memory storage ⚠️ (use a real DB later)
let orders = [];

// POST /api/orders → create a new order
router.post("/", (req, res) => {
  const { orderId, products, total } = req.body;

  if (!orderId || !products || !total) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newOrder = {
    id: orderId,
    products,
    total,
    currency: "EUR",
    status: "Pending",
    createdAt: new Date(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /api/orders → return all orders
router.get("/", (req, res) => {
  res.json(orders);
});

export default router;
