// utils/orderGenerator.js
/**
 * Generate a unique order number
 */
export function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

/**
 * Validate cart items before processing
 */
export function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart items are required');
  }

  for (const item of items) {
    if (!item.productId || !item.name || !item.price || !item.quantity) {
      throw new Error('Each item must have productId, name, price, and quantity');
    }

    if (item.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (item.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
  }

  return true;
}