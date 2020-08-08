const express = require('express');
const tourRouter = express.Router();

const {protect, restrictTo, forgotPassword, resetPassword} = require('../controllers/authController')
const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats,
getMonthlyPlan} = require('../controllers/tourController');

tourRouter
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.post('/forgotPassword', forgotPassword)
tourRouter.post('/resetPassword', resetPassword)

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