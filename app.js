const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const appError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const compression = require('compression')

//express.json is a middleware is function that modify the request data, if we remove it we don't get request in right form



//Set security http headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'http://127.0.0.1:3000/*', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https://*.cloudflare.com', 'http://localhost:3000/'],
      scriptSrc: ["'self'", 'https://*.stripe.com', 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js', 'http://localhost:3000/'],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      upgradeInsecureRequests: [],
    },
  })
);

//body parser - from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(compression())
//data sanitization against NOSQL query injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'sort', 'ratingsAverage', 'ratingsQuantity', 'average', 'maxGroupSize', 'difficulty', 'price']
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//prevents brute force attacks and DOS attacks by limiting requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100, //100 requests from the same ip in one hour
  message: 'too many requests from this ip, try again in an hour'
});
app.use("/api", limiter);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//our own middleware
// app.use((req, res, next) => {

//   console.log('helloo');
//   next();
// });


//only this callback runs in event loop, so no blocking code inside, read heavy right json before


//this setup below is called making sub applications, we have different routers for different routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);
app.use('/api/v1/bookings', bookingRouter);



app.all('*', (req, res, next) => {

  //express assumes anything u pass in next() is an error, error passes to next middleware where response it sent

  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});


//using app.use with a function that has four parameters tells express ur dealing with errors there
app.use(globalErrorHandler);


module.exports = app;