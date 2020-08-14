const express = require('express');

//to accept params from tourRoute
const reviewRouter = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('../controllers/authController');
const { getAllReviews, createReview, deleteReview, updateReview, SetTourId } = require('../controllers/reviewController');

reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), SetTourId, createReview);
reviewRouter.route('/:id').delete(protect, restrictTo('admin', 'user'), deleteReview)
    .patch(protect, restrictTo('user', 'admin'), updateReview);
module.exports = reviewRouter;