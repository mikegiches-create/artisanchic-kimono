import express from "express";
import Order from "../model/Order.js";
import { generateOrderNumber } from "../utilis/orderGenerator.js";

const router = express.Router();

// POST /api/orders → create a new order
router.post("/", async (req, res) => {
  try {
    const { userId, products, total, currency, paypalOrderId, shippingAddress } = req.body;

    if (!products || !total) {
      return res.status(400).json({ error: "Missing required fields: products and total" });
    }

    // Generate unique order ID
    const orderId = generateOrderNumber();

    const newOrder = await Order.create({
      orderId,
      userId: userId || null,
      products,
      total,
      currency: currency || 'GBP',
      paypalOrderId: paypalOrderId || null,
      shippingAddress: shippingAddress || null,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    res.status(201).json({
      success: true,
      order: {
        id: newOrder.id,
        orderId: newOrder.orderId,
        userId: newOrder.userId,
        products: newOrder.products,
        total: newOrder.total,
        currency: newOrder.currency,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        createdAt: newOrder.createdAt,
      }
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/orders → return all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderId: order.orderId,
      userId: order.userId,
      products: order.products,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paypalOrderId: order.paypalOrderId,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/orders/:id → get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.orderId,
        userId: order.userId,
        products: order.products,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paypalOrderId: order.paypalOrderId,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/orders/:id → update order status
router.put("/:id", async (req, res) => {
  try {
    const { status, paymentStatus, paypalOrderId } = req.body;

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Update fields if provided
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paypalOrderId) order.paypalOrderId = paypalOrderId;

    await order.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.orderId,
        userId: order.userId,
        products: order.products,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paypalOrderId: order.paypalOrderId,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      }
    });
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
