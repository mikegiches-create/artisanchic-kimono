// backend/order.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const router = express.Router();

// Load products.json once at startup
const products = JSON.parse(fs.readFileSync("./products.json", "utf-8"));

// PayPal credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment variables.');
}

const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || "sandbox";

// PayPal API base
const base = process.env.PAYPAL_API ||
  (PAYPAL_ENVIRONMENT === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com");

// Generate access token
async function generateAccessToken() {
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errMessage = await response.text();
    throw new Error(`Failed to get PayPal token: ${errMessage}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create order
router.post("/create-order", async (req, res) => {
  try {
    const { items } = req.body; // [{ id: 7, quantity: 1 }, ...]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items payload" });
    }

    // Match items with product details
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) throw new Error(`Product with id ${item.id} not found`);

      return {
        name: product.name,
        unit_amount: {
          currency_code: product.currency,
          value: product.price.toFixed(2),
        },
        quantity: item.quantity.toString(),
      };
    });

    // Calculate total
    const total = orderItems.reduce(
      (sum, i) => sum + parseFloat(i.unit_amount.value) * parseInt(i.quantity),
      0
    );

    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            items: orderItems,
            amount: {
              currency_code: "GBP",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "GBP",
                  value: total.toFixed(2),
                },
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errMessage = await response.text();
      throw new Error(`PayPal create order failed: ${errMessage}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error creating PayPal order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Capture order
router.post("/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: "Missing orderID" });

    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errMessage = await response.text();
      throw new Error(`PayPal capture failed: ${errMessage}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error capturing PayPal order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
