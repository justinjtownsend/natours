const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// 1A) Implement CORS
app.use(cors());

// 1B) Pre-flight handling
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 1C) Helmet: Set security HTTP Headers
// HELMET source URLs configuration for Content Security Policy (CSP)
const connectSrcUrls = [
  // 	'https://unpkg.com',
  'https://*.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  // 	'https://a.tiles.mapbox.com/',
  // 	'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  // 	'https://*.stripe.com',
  // 	'https://bundle.js:*',
  // 	'ws://127.0.0.1:*/',
];

const scriptSrcUrls = [
  // 	'https://unpkg.com/',
  'https://*.cloudflare.com',
  // 	'https://*.mapbox.com/',
  'https://*.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://events.mapbox.com/',
  // 	'https://js.stripe.com',
  // 	'https://m.stripe.network',
  // 	'https://*.cloudflare.com',
];

const styleSrcUrls = [
  //   'https://unpkg.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(helmet()); Add a straightforward CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", ...fontSrcUrls],
        scriptSrc: [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'unsafe-eval'",
          ...scriptSrcUrls,
        ],
        'frame-src': ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
        // 'form-action': ["'self'"],
        connectSrc: [
          "'self'",
          // "'unsafe-inline'",
          'data:',
          'blob:',
          'ws:',
          'http:',
          ...connectSrcUrls,
        ],
      },
    },
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Testing middleware
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
