const express = require('express');
const viewRouter = express.Router();
const { getOverview, getTour, login, getAccount, getMyTours } = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const { router } = require('../app');

viewRouter.route('/').get(createBookingCheckout, isLoggedIn, getOverview);
viewRouter.route('/tour/:slug').get(isLoggedIn, getTour);
viewRouter.route('/login').get(isLoggedIn, login);
viewRouter.route('/me').get(protect, getAccount);
viewRouter.route('/my-tours').get(protect, getMyTours)

module.exports = viewRouter;