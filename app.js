const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController')
//express.json is a middleware is function that modify the request data, if we remove it we don't get request in right form
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

}
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

app.all('*', (req, res, next) => {

  //express assumes anything u pass in next() is an error, error passes to next middleware where response it sent
  
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


//using app.use with a function that has four parameters tells express ur dealing with errors there
app.use(globalErrorHandler);


module.exports = app;