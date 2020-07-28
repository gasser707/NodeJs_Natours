const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//express.json is a middleware is function that modify the request data, if we remove it we dont get request in right form
app.use(express.json());
app.use(morgan('dev'));

//our own middleware
app.use((req, res, next) => {

  console.log('helloo');
  next();
});

// app.get('/', (req, res) => {
//   res.json({ message: 'hello from the server', app: 'g-tours' });
// });

// app.post('/', (req,res)=> {
//     res.send('you can post to this end point')
// });

//only this callback runs in event loop, so no blocking code inside, read heavy right json before


//this setup below is called making sub applications, we have different routers for different routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);



module.exports = app;