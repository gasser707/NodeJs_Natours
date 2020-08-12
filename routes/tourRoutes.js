const express = require('express');
const tourRouter = express.Router();
const reviewRouter = require('./reviewRoutes')
const {createReview} = require('../controllers/reviewController')
const {protect, restrictTo} = require('../controllers/authController')
const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats,
getMonthlyPlan} = require('../controllers/tourController');

tourRouter.use('/:tourId/reviews',reviewRouter)

tourRouter
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);


tourRouter
    .route('/')
    .get(protect, getAllTours)
    .post(protect,createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .delete(protect, restrictTo('admin', 'lead-guide'),deleteTour)
    .patch(updateTour);



module.exports = tourRouter;