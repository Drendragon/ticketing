import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: '2022-08-01'
});

export {stripe}
