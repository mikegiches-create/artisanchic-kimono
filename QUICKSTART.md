# Backend Quick Start Guide

Get your Kimono Shop backend running with MySQL in 5 minutes!

## Prerequisites Check

- [ ] Node.js installed (v16+)
- [ ] MySQL installed and running
- [ ] Terminal/Command Prompt open

## Step-by-Step Setup

### 1️⃣ Create MySQL Database (1 minute)

Open MySQL command line:
```bash
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE kimono_shop;
EXIT;
```

### 2️⃣ Configure Backend (1 minute)

Navigate to backend folder:
```bash
cd backend
```

Copy environment file:
```bash
# Windows PowerShell
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` file and update your MySQL password:
```env
DB_PASSWORD=your_mysql_password_here
```

### 3️⃣ Install Dependencies (1 minute)

```bash
npm install
```

### 4️⃣ Setup Database (1 minute)

Test connection first:
```bash
npm run db:test
```

If successful, setup database:
```bash
npm run db:setup
```

This will:
- ✅ Create tables (users, products, orders)
- ✅ Import 8 kimono products
- ✅ Verify everything works

### 5️⃣ Start Server (30 seconds)

```bash
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully
✅ Database synchronized
🚀 Server running on host localhost port 4243
```

## Verify It Works

Open a new terminal and test:

```bash
# Health check
curl http://localhost:4243/api/health

# Get products
curl http://localhost:4243/api/products
```

Or open in browser:
- Health: http://localhost:4243/api/health
- Products: http://localhost:4243/api/products

## Common Issues

### ❌ "Access denied for user 'root'"
**Fix:** Update password in `.env` file

### ❌ "Unknown database 'kimono_shop'"
**Fix:** Run `CREATE DATABASE kimono_shop;` in MySQL

### ❌ "Cannot find module"
**Fix:** Run `npm install` in backend folder

### ❌ "Port 4243 already in use"
**Fix:** Change `PORT=3000` in `.env` file

## What's Next?

✅ Backend is running on http://localhost:4243

Now you can:
1. Start the frontend: `cd ../frontend && npm run dev`
2. Test API endpoints
3. Build your application

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server (development) |
| `npm start` | Start server (production) |
| `npm run db:test` | Test MySQL connection |
| `npm run db:init` | Create database tables |
| `npm run db:seed` | Import products |
| `npm run db:setup` | Init + Seed (one command) |

## API Endpoints

- `GET /api/health` - Server status
- `GET /api/products` - All products
- `GET /api/products/:id` - Single product
- `GET /api/products?category=formal` - Filter by category
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/orders` - Create order
- `POST /api/payment/create-order` - PayPal payment

## Need Help?

1. Check `backend/README.md` for detailed docs
2. Check `SETUP_MYSQL.md` for MySQL help
3. Check `MYSQL_IMPLEMENTATION.md` for technical details

## Success! 🎉

Your backend is now running with MySQL database. All products are stored in the database and ready to use!
