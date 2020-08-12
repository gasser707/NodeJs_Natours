const express = require('express');

//to accept params from tourRoute
const reviewRouter = express.Router({mergeParams:true});

const { protect, restrictTo } = require('../controllers/authController');
const { getAllReviews, createReview } = require('../controllers/reviewController');

reviewRouter.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);

module.exports = reviewRouter;