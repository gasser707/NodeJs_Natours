const express = require('express');
const tourRouter = express.Router();

const { getAllTours, getTour, deleteTour, updateTour, createTour } = require('../controllers/tourController');



tourRouter
    .route('/')
    .get(getAllTours)
    .post(createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .delete(deleteTour)
    .patch(updateTour);


module.exports = tourRouter;