const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async (req, res, next) => {
    //1- get tour data from backend
    const tours = await Tour.find();

    //2 build template


    //3- build template from  step 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' });
    if (tour) {
        res
            .status(200)
            .set(
                'Content-Security-Policy',
                "default-src 'self' https://*.mapbox.com https://js.stripe.com/ ws:; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
            )
         
            .render('tour', {
                tour: tour,
                title: tour.name
            });

    }
    return next(new AppError('There is no such tour in our program', 404));
});

exports.login = catchAsync(async (req, res) => {

    res.status(200)
        .render('login', {
            title: 'Log into your account'
        });
});
exports.signup = catchAsync(async (req, res) => {

    res.status(200)
        .render('signup', {
            title: 'Create your account'
        });
});
exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    });
};

exports.getMyTours = catchAsync(async(req, res, next) => {
        const bookings = await Booking.find({user:req.user.id});
        const tourIds = bookings.map(el=>el.tour)
        const tours = await Tour.find({_id: {$in: tourIds}})

        res.status(200).render('overview', {
            title:'Booked Tours',
            tours
        })
});