const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

//a user can review a tour once, no duplicate reviews
reviewSchema.index({tour:1, user:1}, {unique:true})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    //this refers to Model
    const stats = await this.aggregate([
        {
            //filtering basically
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: 0,
          ratingsAverage: 4.5
        });
      }
};

//post middleware doesn't have next
reviewSchema.post('save', async function () {
    //this refers to doc constructor is model(Review) that created doc
    await this.constructor.calcAverageRatings(this.tour);
});

//we are trying here to update review in the tour too when we change it 
//we needed to get two methods because we don't have access to this.constructor directly in findOneAndUpdate
reviewSchema.pre(/^findOneAnd/, async function(next){
    //this refers to query , rev is a review doc
    this.rev = await this.findOne()
    next()
})
//for statistics after
reviewSchema.post(/^findOneAnd/, async function(){
    //we couldn't do : await this.findOne() here as query has already executed
    await this.rev.constructor.calcAverageRatings(this.rev.tour)
})
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


//post /tour/745e44236/reviews
//get /tour/23455/reviews
//get /tour/4354/reviews/4r43t45