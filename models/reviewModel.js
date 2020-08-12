const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, `A review can't be empty`]
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});



reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: '-__v -locations -description -images -startLocation',
    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // })

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


//post /tour/745e44236/reviews
//get /tour/23455/reviews
//get /tour/4354/reviews/4r43t45