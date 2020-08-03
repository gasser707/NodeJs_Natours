const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const { Router } = require('express');

//express.json is a middleware is function that modify the request data, if we remove it we don't get request in right form
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

}
app.use(express.static(`${__dirname}/public`));

//our own middleware
app.use((req, res, next) => {

  console.log('helloo');
  next();
});


//only this callback runs in event loop, so no blocking code inside, read heavy right json before


//this setup below is called making sub applications, we have different routers for different routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next)=>{
  res.status(404).json({
    status:'fail',
    message:`Can't find ${req.originalUrl} on this server!`
  })
})


module.exports = app;