const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                    `https://g-tours.herokuapp.com/img/tours/${tour.imageCover}`
                ],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session: session
    });

});

const createBookingCheckout = catchAsync(async (session) => {
    try{
    console.log(11)
    const tour = session.client_reference_id;
    const myUser = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    console.log(myUser)
    console.log(tour)
    console.log(price)
    console.log(14)
    await Booking.create({ tour, myUser, price });
    console.log(10)
    }catch(err){
        console.log('err here ',  err.message)
    }
});

exports.webhookCheckout = catchAsync(async(req, res,next) => {
    const signature = req.headers['stripe-signature'];
  
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed')
      {
          console.log(22)
          await createBookingCheckout(event.data.object);
          console.log(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
          return res.status(200).json({ received: true });
      }
    } catch (err) {
        console.log(25)
        console.log(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }
  });
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.deleteBooking = factory.deleteOne(Booking);