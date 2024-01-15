/* eslint-disable */
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51OYrYFFQf7VsrfpSKtE80nLfwOGaPJEBoIlkmc7ySUhqagjtqucR5QVhOQZ9W0SMrKMZDaBo1r14WsTaTEL1TLFG00IcEvK632');

export const bookTour = async tourId => {
  try {
    //  1) Get the checkout session from API
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)

    console.log(session);

    //  2) Create checkout form + charge the CC for us
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};