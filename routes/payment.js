// backend/routes/payment.js
import express from "express";
import axios from "axios";

const router = express.Router();

// PayPal API Base URL (Sandbox or Live)
const PAYPAL_API =
  process.env.PAYPAL_API || "https://api-m.paypal.com";

// 🔑 Get PayPal access token
async function getAccessToken() {
  const auth = Buffer.from(
    `Ae53Yrvvid-NyP6Cszyl5XIY196NMUdDuA2G5tvgkL0n8Nso95pE2a_RUR-3P4k5RZ07yATerLtr-2y7:ELMqlVHRgwVA9djkseBJoJuaEcLhthAEiur2pvY1QHabrc_qFuJCrFXYqDpTFef982k_QxQjgD50JDvV`
  ).toString("base64");

  const response = await axios({
    url: `${PAYPAL_API}/v1/oauth2/token`,
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    data: "grant_type=client_credentials",
  });

  return response.data.access_token;
}

// 🛒 Create PayPal order with Level 2 & 3 fields
router.post("/create-order", async (req, res) => {
  const {
    amount,
    currency,
    taxAmount,
    purchaseOrderNumber,
    shippingAmount,
    shippingTaxAmount,
    discountAmount,
    shipsFromPostalCode,
    shipping,
    lineItems,
  } = req.body;

  if (!amount || !currency) {
    return res
      .status(400)
      .json({ error: "Missing required fields: amount and currency" });
  }

  try {
    const accessToken = await getAccessToken();

    console.log("📦 Creating PayPal order with:", {
      amount,
      currency,
      taxAmount,
      purchaseOrderNumber,
    });

    // --- Defaults to prevent "missing required fields" ---
    const safeTax = parseFloat(taxAmount || 0).toFixed(2);
    const safeShipAmt = parseFloat(shippingAmount || 0).toFixed(2);
    const safeShipTax = parseFloat(shippingTaxAmount || 0).toFixed(2);
    const safeDiscount = parseFloat(discountAmount || 0).toFixed(2);
    const safeCurrency = currency || "GBP";

    // Calculate item total automatically if lineItems provided
    let itemTotal = 0;
    if (lineItems && lineItems.length > 0) {
      itemTotal = lineItems.reduce((sum, item) => {
        return (
          sum + parseFloat(item.unitAmount || 0) * parseInt(item.quantity || 1)
        );
      }, 0);
    } else {
      itemTotal = parseFloat(amount) - parseFloat(safeTax) - parseFloat(safeShipAmt) + parseFloat(safeDiscount);
    }

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: purchaseOrderNumber || `PO-${Date.now()}`,
            invoice_id: purchaseOrderNumber || `INV-${Date.now()}`,
            amount: {
              currency_code: safeCurrency,
              value: parseFloat(amount).toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: safeCurrency,
                  value: itemTotal.toFixed(2),
                },
                tax_total: {
                  currency_code: safeCurrency,
                  value: safeTax,
                },
                shipping: {
                  currency_code: safeCurrency,
                  value: safeShipAmt,
                },
                discount: {
                  currency_code: safeCurrency,
                  value: safeDiscount,
                },
              },
            },
            shipping: shipping || {
              name: {
                full_name: "Default Buyer",
              },
              address: {
                address_line_1: "123 Main Street",
                admin_area_2: "London",
                admin_area_1: "London",
                postal_code: shipsFromPostalCode || "EC1A1BB",
                country_code: "GB",
              },
            },
            items: (lineItems || []).map((item, index) => ({
              name: item.name || `Item ${index + 1}`,
              sku: item.productCode || `SKU-${index + 1}`,
              unit_amount: {
                currency_code: safeCurrency,
                value: parseFloat(item.unitAmount || 0).toFixed(2),
              },
              tax: {
                currency_code: safeCurrency,
                value: parseFloat(item.taxAmount || 0).toFixed(2),
              },
              quantity: String(item.quantity || 1),
              description: item.commodityCode || "Standard Item",
              category: "PHYSICAL_GOODS",
            })),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Error creating order:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to create PayPal order",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Capture PayPal order
router.post("/capture-order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Error capturing order:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to capture PayPal order",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
