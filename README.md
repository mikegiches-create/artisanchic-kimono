# Kimono Shop Backend

Backend API server for the Kimono Style Shop e-commerce application.

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Payment**: PayPal Checkout SDK
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure MySQL Database

Make sure MySQL is running on your system. Create a database:

```sql
CREATE DATABASE kimono_shop;
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kimono_shop
DB_USER=root
DB_PASSWORD=your_mysql_password

# Server Configuration
PORT=4243
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=24h

# PayPal Configuration (optional for testing)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_API=https://api-m.sandbox.paypal.com
PAYPAL_ENVIRONMENT=sandbox
```

### 4. Initialize Database

Run the database initialization script to create tables:

```bash
npm run db:init
```

This will:
- Test the database connection
- Create all necessary tables (users, products, orders)
- Run basic CRUD tests
- Clean up test data

### 5. Seed Database with Products

Populate the database with initial product data:

```bash
npm run db:seed
```

This will import all products from `data/products.json` into the MySQL database.

**Quick Setup (Init + Seed):**
```bash
npm run db:setup
```

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:4243` (or your configured PORT).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server in development mode with nodemon |
| `npm start` | Start server in production mode |
| `npm run db:init` | Initialize database and create tables |
| `npm run db:seed` | Seed database with products from JSON |
| `npm run db:setup` | Run init and seed in sequence |

## API Endpoints

### Products

- `GET /api/products` - Get all products (with optional filters)
  - Query params: `category`, `inStock`, `minPrice`, `maxPrice`, `search`
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Payment

- `POST /api/payment/create-order` - Create PayPal order
- `POST /api/payment/capture-order/:orderId` - Capture PayPal payment

### Health Check

- `GET /api/health` - Server health status
- `GET /debug/cors` - CORS configuration debug

## Database Models

### Product
- id, name, description, price, originalPrice, currency
- image, images (JSON array)
- category (formal, casual, outerwear)
- inStock, colors (JSON array)
- averageRating, reviewCount, verifiedPurchase
- ratingBreakdown (JSON object)

### User
- id, name, email, password (hashed)
- resetPasswordToken, resetPasswordExpire

### Order
- id, orderId, userId (FK to User)
- products (JSON array), total, currency
- status (Pending, Processing, Shipped, Delivered, Cancelled)
- paymentStatus (Pending, Completed, Failed, Refunded)
- paypalOrderId, shippingAddress (JSON)

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Body Size Limit**: 10kb max request body
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Sanitization**: NoSQL injection prevention

## Troubleshooting

### Database Connection Issues

1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```

2. Check database exists:
   ```sql
   SHOW DATABASES;
   ```

3. Verify credentials in `.env` file

### Port Already in Use

If port 4243 is in use, change the `PORT` in `.env`:
```env
PORT=3000
```

### Products Not Loading

1. Ensure database is seeded:
   ```bash
   npm run db:seed
   ```

2. Check products table:
   ```sql
   USE kimono_shop;
   SELECT COUNT(*) FROM products;
   ```

## Development Notes

- The server uses ES modules (`type: "module"` in package.json)
- Sequelize will auto-sync tables in development mode
- All passwords are hashed before storage
- JWT tokens expire after 24 hours (configurable)
- CORS allows all origins in development mode

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Configure specific CORS origins in `CORS_ALLOWED_ORIGINS`
3. Use strong `JWT_SECRET`
4. Enable `SECURE_COOKIE=true` for HTTPS
5. Configure proper MySQL credentials
6. Set up SSL/TLS for database connection
7. Use environment variables for all secrets

## Support

For issues or questions, check the main project README or create an issue in the repository.
