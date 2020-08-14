const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const { default: validator } = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must be at most 40 characters'],
        minlength: [7, 'A tour name must be at least 7 characters'],
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a maximum group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be at above or equal to 1.0'],
        max: [5, 'Rating must be below or equal to 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this here refers to document object, only when creating not when updating
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) can not be bigger than original price'
        }
    },
    //removes white space at beginning and end of string
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a summary"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover"]
    },
    images: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: {
        type: [Date]
    },
    slug: {
        type: String
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //Geo-json        
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    //embedded document of location
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: 'Point',
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]


}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});

// we need indexes so that Mongo doesn't have to go and search through the whole db when its filtering for a doc 
// with price range for example
tourSchema.index({'startLocation.coordinates': '2dsphere'})//different as this is geo-spatial queries
tourSchema.index({price: 1, ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7;
    //this here refers to the current document
});

//VIRTUAL POPULATE FOR REVIEWS, allows to keep reference without saving more data to db
tourSchema.virtual('reviews', {
    ref: 'Review',
    //name of the field in the review model
    foreignField: 'tour',
    //name of the field in this model
    localField: '_id'
});

// DOCUMENT MIDDLEWARE

//document middleware that will run before .save() and .create()

// tourSchema.pre('save', function(next){
//     console.log(11234)
//     next()
// })


// EMBEDDING USERS

// tourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromise);
//     next();
// });

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });


//QUERY MIDDLEWARE

//used regex to apply it for all methods that start with find
// tourSchema.pre(/^find/, function(next){
//     //this will refer to query 

//     this.start = Date.now()
//     this.find({secretTour :{$ne:true}})
//     next()
// })


// tourSchema.post(/^find/, function(docs,next){
//     console.log(docs)
//     console.log('this took ' + (Date.now()- this.start) +' millisecs' )
//     next()
// })

tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });
  
    next();
  });


// //AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function(next){
// //this here would refer to the current aggregate object


// Add a `$match` to the beginning of the pipeline
//     this.pipeline().unshift({$match : {secretTour: {$ne: true}}})
//     console.log
//     next()
// })





const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;