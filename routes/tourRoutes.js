const express = require('express');
const tourRouter = express.Router();
const reviewRouter = require('./reviewRoutes');
const { protect, restrictTo } = require('../controllers/authController');
const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats,
    getMonthlyPlan, getToursWithin, getDistances, uploadTourImages, resizeTourImages } = require('../controllers/tourController');

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);


tourRouter.route('/tours-within/:distances/center/:latlng/unit/:unit').get(getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);
tourRouter
    .route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
    .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour);



module.exports = tourRouter;