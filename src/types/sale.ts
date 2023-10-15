import Stripe from "stripe";

export type Transaction = Stripe.Response<Stripe.PaymentIntent>;

export enum SALE_STATUS {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  REQUIRES_PAYMENT = 'REQUIRES_PAYMENT',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
  RECEIVED = 'RECEIVED',
  DELIVERED = 'DELIVERED',
}

export type SaleProduct = {
  id: string;
  title: string;
  quantity: number;
  value: number;
};

export type Sale = {
  id?: string;
  sellerId: string;
  sellerAccountId: string;
  customerId: string;
  customerAccountId: string;
  status: SALE_STATUS;
  products: SaleProduct[];
  total: number;
  currency?: string;
  transaction?: Transaction;
  paymentMethodId?: string;
  _createdAt?: number;
};
