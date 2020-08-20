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
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.index({tour:1, user:1}, {unique:true})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
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

reviewSchema.post('save', async function () {
    //this refers to doc constructor is model(Review) that created doc
    await this.constructor.calcAverageRatings(this.tour);
});


reviewSchema.pre(/^findOneAnd/, async function(next){
    this.rev = await this.findOne()
    next()
})
reviewSchema.post(/^findOneAnd/, async function(){
    await this.rev.constructor.calcAverageRatings(this.rev.tour)
})
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


