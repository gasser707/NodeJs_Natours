const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory')


exports.SetTourId = (req, res, next) => {
    if(!req.body.tour){
        req.body.tour=req.params.tourId
    }
    if(!req.body.user){
        req.body.user= req.user._id
    }
    next()
}

exports.deleteReview = factory.deleteOne(Review)

exports.updateReview = factory.updateOne(Review)

exports.getReview = factory.getOne(Review)

exports.getAllReviews = factory.getAll(Review)

exports.createReview = factory.createOne(Review)