const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//express.json is a middleware is function that modify the request data, if we remove it we don't get request in right form


//Set security http headers
app.use(helmet());

//body parser - from body to req.body
app.use(express.json({ limit: '10kb' }));

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

//serving static files
app.use(express.static(`${__dirname}/public`));
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


app.all('*', (req, res, next) => {

  //express assumes anything u pass in next() is an error, error passes to next middleware where response it sent

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


//using app.use with a function that has four parameters tells express ur dealing with errors there
app.use(globalErrorHandler);


module.exports = app;