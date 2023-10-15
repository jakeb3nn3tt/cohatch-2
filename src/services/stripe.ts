import Stripe from "stripe";

export const stripe = new Stripe(TEST_KEY, {
  apiVersion: "2023-08-16"
});