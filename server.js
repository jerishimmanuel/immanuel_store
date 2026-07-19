const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;
const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/immanuel_store';

const productSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const orderSchema = new mongoose.Schema({
  items: Array,
  customerName: String,
  customerEmail: String,
  address: String,
  total: Number,
  status: String,
  eta: String,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

function getDefaultProducts() {
  return [
    { productId: 1, name: 'Dress', price: 1299, category: 'fashion', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80', description: 'Stylish cotton dress for everyday comfort.' },
    { productId: 2, name: 'Snacks', price: 199, category: 'grocery', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', description: 'Mix of crunchy snacks and savory bites.' },
    { productId: 3, name: 'Detergent', price: 349, category: 'household', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', description: 'Powerful detergent for bright and fresh laundry.' },
    { productId: 4, name: 'Water Bottle', price: 499, category: 'essentials', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', description: 'Durable bottle for daily hydration.' },
    { productId: 5, name: 'Face Cream', price: 599, category: 'beauty', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', description: 'Moisturizing cream for soft and healthy skin.' },
    { productId: 6, name: 'Mobile Charger', price: 799, category: 'electronics', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', description: 'Fast charging cable for your everyday devices.' },
    { productId: 7, name: 'Jeans', price: 1599, category: 'fashion', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', description: 'Classic denim jeans for daily wear.' },
    { productId: 8, name: 'Biscuits', price: 149, category: 'grocery', image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80', description: 'Assorted buttery biscuits for tea-time.' },
    { productId: 9, name: 'Soap', price: 89, category: 'household', image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80', description: 'Gentle soap for daily hygiene.' },
    { productId: 10, name: 'Notebook', price: 249, category: 'essentials', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80', description: 'Neat notebook for study and planning.' },
    { productId: 11, name: 'Perfume', price: 999, category: 'beauty', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', description: 'Long-lasting fragrance for everyday use.' },
    { productId: 12, name: 'Socks', price: 199, category: 'fashion', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', description: 'Comfortable cotton socks in a pack.' },
    { productId: 13, name: 'Smartphone', price: 18999, category: 'electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', description: 'Feature-rich smartphone with excellent battery life.' },
    { productId: 14, name: 'Laptop', price: 45999, category: 'electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', description: 'Slim laptop for work, study, and entertainment.' },
    { productId: 15, name: 'Headphones', price: 2499, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', description: 'High-quality headphones with rich bass.' },
    { productId: 16, name: 'Smart TV', price: 32999, category: 'electronics', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80', description: 'Crisp display with smart streaming features.' },
    { productId: 17, name: 'Gaming Mouse', price: 1299, category: 'electronics', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80', description: 'Precision gaming mouse with RGB lighting.' },
    { productId: 18, name: 'Keyboard', price: 1799, category: 'electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', description: 'Comfortable keyboard for work and play.' },
    { productId: 19, name: 'Camera', price: 25999, category: 'electronics', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', description: 'Compact camera for memorable moments.' },
    { productId: 20, name: 'Air Freshener', price: 249, category: 'household', image: 'https://images.unsplash.com/photo-1608571424352-9261a1e1e6f0?auto=format&fit=crop&w=800&q=80', description: 'Fresh fragrance for a clean home atmosphere.' }
  ];
}

async function connectDb() {
  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await seedProducts();
}

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(getDefaultProducts());
  }
}

async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'immanuel-store-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/products', async (req, res) => {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      const term = new RegExp(search, 'i');
      query.$or = [
        { name: term },
        { description: term }
      ];
    }
    const products = await Product.find(query).sort({ productId: 1 }).lean();
    res.json(products);
  });

  app.get('/api/products/:id', async (req, res) => {
    const product = await Product.findOne({ productId: Number(req.params.id) }).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = await User.create({ name, email, password });
    req.session.user = { id: newUser._id, name: newUser.name, email: newUser.email };
    res.status(201).json({ id: newUser._id, name: newUser.name, email: newUser.email });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({ id: user._id, name: user.name, email: user.email });
  });

  app.post('/api/orders', async (req, res) => {
    const { items, customerName, customerEmail, total, address } = req.body;
    if (!items || !items.length || !customerName || !customerEmail || !total || !address) {
      return res.status(400).json({ message: 'Incomplete order' });
    }

    const eta = new Date();
    eta.setDate(eta.getDate() + 4);

    const order = await Order.create({
      items,
      customerName,
      customerEmail,
      address,
      total,
      status: 'Processing',
      eta: eta.toDateString()
    });
    res.status(201).json(order);
  });

  app.get('/api/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  });

  app.get('/api/me', (req, res) => {
    if (req.session.user) {
      return res.json(req.session.user);
    }
    res.status(401).json({ message: 'Not logged in' });
  });

  app.get('/api/debug', async (req, res) => {
    const [products, users, orders] = await Promise.all([
      Product.find().sort({ productId: 1 }).lean(),
      User.find().lean(),
      Order.find().sort({ createdAt: -1 }).lean()
    ]);
    res.json({ products, users, orders });
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

  app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  });

  app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
  });

  app.get('/*', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path.replace(/^\//, ''));
    res.sendFile(filePath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      }
    });
  });

  return app;
}

async function resetDb() {
  await Product.deleteMany({});
  await User.deleteMany({});
  await Order.deleteMany({});
  await seedProducts();
}

if (require.main === module) {
  connectDb().then(async () => {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
}

module.exports = { createApp, resetDb, connectDb };

