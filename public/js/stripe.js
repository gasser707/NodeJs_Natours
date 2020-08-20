import axios from "axios";
import { showAlert } from './alerts';
export const bookTour = async tourId => {
    try {
        const stripe = Stripe('pk_test_51HHcq2Ho33ABNkeREGGt62m3xmaUtpO3E4tzmtc2FCpJvj2s3oqW9wubdZlvX9zL5JfF84mFD5TgP8AHE8Pf90Zm00rAHZSEIe');
        const session = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(err){
        showAlert('error', err )
    }


};