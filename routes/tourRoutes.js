const express = require('express');
const tourRouter = express.Router();
const { getAllTours, getTour, deleteTour, updateTour, createTour, checkID, checkBody } = require('../controllers/tourController');

//param middleware checks for id before sending next function
tourRouter.param('id', checkID);

tourRouter
    .route('/')
    .get(getAllTours)
    .post(checkBody, createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .delete(deleteTour)
    .patch(updateTour);

module.exports = tourRouter;