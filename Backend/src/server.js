const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('../routes/auth'); // Import routes

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'hackaura-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/api/auth', authRoutes); // Use auth routes

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('Hello from Backend'));

module.exports = app;
