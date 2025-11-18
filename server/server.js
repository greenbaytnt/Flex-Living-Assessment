const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const reviewsRouter = require('./routes/reviews');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const { connectDB } = require('./db');

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().catch(err => console.error('Database connection failed:', err));
}

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:5173',                
  'http://localhost:5174',                   
  'http://localhost:3000',
  'http://127.0.0.1:5173',                  
  process.env.FRONTEND_URL,                  
  /\.vercel\.app$/,               
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Flex Living Reviews API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/reviews', reviewsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

module.exports = app;
