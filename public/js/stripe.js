import axios from "axios";
import { showAlert } from './alerts';
export const bookTour = async tourId => {
    try {
        const stripe = Stripe('pk_test_51HHcq2Ho33ABNkeREGGt62m3xmaUtpO3E4tzmtc2FCpJvj2s3oqW9wubdZlvX9zL5JfF84mFD5TgP8AHE8Pf90Zm00rAHZSEIe');
        //1- get session from server endpoint
        const session = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session);
        //2- use stripe object to create form and charge credit card
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(err){
        console.log(err);
        showAlert('error', err )
    }


};