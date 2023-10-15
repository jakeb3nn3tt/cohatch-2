import * as functions from "firebase-functions";
import { firestore } from "./services/firebase";
import { stripe } from "./services/stripe";
import { Sale } from "./types/sale";
import { getDoneHtml, getNotFoundHtml, getRetryHtml } from "./utils/html";
import { notifySaleUpdate, notifyUser } from "./utils/notifications";
import { updateProducts } from "./utils/products";
import { calculateFeeAmount, formatMoneyToStripe, generateStripeAccountLink, saveTransaction } from "./utils/stripe";

export const placeOrder = functions.https.onCall(async (data: Sale[], context) => {
  // iterate thorugh sales, calculate taxes for every step of the way (delivery men, app and farmers)
  // see the best way to use stripe to pay people
  // call generate payment (multiple times?)
});

export const generatePayment = functions.https.onCall(async (data: Sale, context) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatMoneyToStripe(data.total),
      currency: data.currency || 'usd',
      customer: data.customerAccountId,
      payment_method_types: ['card'],
      payment_method: data.paymentMethodId,
      off_session: true,
      confirm: true,
      application_fee_amount: calculateFeeAmount(data),
      transfer_data: {
        destination: data.sellerAccountId
      }
    });
    if (paymentIntent.status === "succeeded") {
      const orderId = saveTransaction(paymentIntent, data);
      updateProducts(data.products);
      notifyUser(data.sellerId, 'Product sold', `Sale: #${orderId}`);
    } else {
      console.log('data', JSON.stringify({ data, transaction: paymentIntent }));
    }
    return paymentIntent;
  } catch (error) {
    console.log('error', error);
    return error;
  }
});

export const createStripeSeller = functions.https.onCall(async (data, context) => {
  const account = await stripe.accounts.create({
    email: data.email,
    type: 'express',
  });
  return account.id;
});

export const getStripeAccountLink = functions.https.onCall(async (data, context) => {
  const accountLink = await generateStripeAccountLink(data.accountId);
  return accountLink;
});

export const createStripeCustomer = functions.https.onCall(async (data, context) => {
  const customer = await stripe.customers.create({
    name: data.name,
    email: data.email,
  });
  return customer.id;
});

export const getStripeCustomerSecret = functions.https.onCall(async (data, context) => {
  const intent = await stripe.setupIntents.create({
    customer: data.customerId,
  });
  return intent.client_secret;
});

export const getStripeCustomerPaymentMethods = functions.https.onCall(async (data, context) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: data.customerId,
    type: 'card',
  });
  return paymentMethods.data;
});

export const deleteStripeCustomerPaymentMethod = functions.https.onCall(async (data, context) => {
  await stripe.paymentMethods.detach(data.paymentMethodId);
});

export const getStripeAccountInformation = functions.https.onCall(async (data, context) => {
  if (!data.accountId) return undefined;
  const response = await stripe.accounts.retrieve(data.accountId);
  return response;
});

export const onStripeReturnUrl = functions.https.onRequest(async (req, res) => {
  try {
    const accountId = req.query.accountId as string;
    if (!accountId) {
      throw new Error();
    }
    const response = await stripe.accounts.retrieve(accountId);
    if (response.details_submitted) {
      await firestore.collection('stripeInfo').doc(accountId).set(response);
      res.send(getDoneHtml());
    } else {
      const accountLink = await generateStripeAccountLink(accountId);
      res.send(getRetryHtml(accountLink));
    }
  } catch (error) {
    res.send(getNotFoundHtml());
  }
});

export const onStripeRefreshUrl = functions.https.onRequest(async (req, res) => {
  try {
    const accountId = req.query.accountId as string;
    if (!accountId) {
      throw new Error();
    }
    const accountLink = await generateStripeAccountLink(accountId);
    res.send(getRetryHtml(accountLink));
  } catch (error) {
    res.send(getNotFoundHtml());
  }
});

export const saleUpdate = functions.firestore.document('sales/:id').onUpdate((change, context) => {
  const newValue = change.after.data();
  const previousValue = change.before.data();
  if (newValue && previousValue) {
    if (newValue.status !== previousValue.status) {
      notifySaleUpdate(newValue.customerId, newValue.sellerId, newValue.id, newValue.status);
    }
  }
});
