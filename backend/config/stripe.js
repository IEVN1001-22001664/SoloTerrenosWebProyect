const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Falta STRIPE_SECRET_KEY en variables de entorno");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;