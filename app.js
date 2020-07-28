const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan')

//express.json is a middleware is function that modify the request data, if we remove it we dont get request in right form
app.use(express.json());
app.use(morgan('dev'));

app.use ((req, res, next)=>{

  console.log('helloo 😂');
  next()
})

// app.get('/', (req, res) => {
//   res.json({ message: 'hello from the server', app: 'g-tours' });
// });

// app.post('/', (req,res)=> {
//     res.send('you can post to this end point')
// });

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((el) => el.id === id);

  if (tour) {
    return res.status(200).json({
      status: 'success',
      results: 1,
      data: {
        tour: tour,
      },
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  }
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  //use asynchronous because ur inside the event loop
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const deleteTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((el) => el.id === id);

  if (tour) {
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      data: null,
    });
  }
};

const updateTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((el) => el.id === id);

  if (tour) {
    res.status(200).json({
      status: 'success',
      data: {
        tour: 'updated tour',
      },
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  }
};

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//only this callback runs in event loop, so no blocking code inside, read heavy json before

app
.route('/api/v1/tours')
.get(getAllTours)
.post(createTour);

app
.route('/api/v1/tours/:id')
.get(getTour)
.delete(deleteTour)
.patch(updateTour);

app
.route('/api/v1/users')
.get(getAllUsers)
.post(createUser);

app
.route('/api/v1/user/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser)

const port = 3000;
app.listen(port, () => {
  console.log(`running on port ${port}...`);
});
