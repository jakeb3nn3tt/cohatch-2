import Stripe from "stripe";
import { HTTPS_FUNCTION_BASE } from "../constants";
import { firestore } from "../services/firebase";
import { stripe } from "../services/stripe";
import { SALE_STATUS, Sale, Transaction } from "../types/sale";

const formatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  minimumFractionDigits: 2,
});

export const formatMoneyToStripe = (value: number) => {
  return Number(formatter.format(value).replace('.', '').replace(',', ''));
};

export const calculateFeeAmount = (sale: Sale) => 100;

export const getStatusConversion = (status: Stripe.PaymentIntent.Status) => {
  switch (status) {
    case "canceled":
      return SALE_STATUS.CANCELED;
    case "succeeded":
      return SALE_STATUS.PAID;
    default: return SALE_STATUS.PROCESSING;
  }
};

export const generateStripeAccountLink = async (accountId: string) => {
  const response = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${HTTPS_FUNCTION_BASE}/onStripeRefreshUrl?accountId=${accountId}`,
    return_url: `${HTTPS_FUNCTION_BASE}/onStripeReturnUrl?accountId=${accountId}`,
    type: 'account_onboarding',
  });
  return response.url;
};

export const saveTransaction = (transaction: Transaction, sale: Sale) => {
  const saleStatus = getStatusConversion(transaction.status);
  sale.status = saleStatus;
  // if (transaction.status === "succeeded") {
  sale.transaction = transaction;
  // }
  const doc = firestore.collection('sales').doc();
  sale.id = doc.id;
  doc.set(sale);
  return doc.id;
};