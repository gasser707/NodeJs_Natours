const express = require('express');
const tourRouter = express.Router();

const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats, getMonthlyPlan } = require('../controllers/tourController');

tourRouter
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);



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