const express = require('express');
const{protect, isLoggedIn, restrictTo} = require('../controllers/authController')
const{getCheckoutSession, getAllBookings, createBooking, getBooking, deleteBooking
, updateBooking}= require('../controllers/bookingController');
const bookingRouter = express.Router()


bookingRouter.route('/checkout-session/:tourId').get(protect,getCheckoutSession)

bookingRouter.use(protect, restrictTo('admin', 'lead-guide'))
bookingRouter.route('/').get(getAllBookings).post(createBooking)

bookingRouter.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking)
module.exports =bookingRouter