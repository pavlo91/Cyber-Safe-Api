const Stripe = require("stripe"); // Stripes custom node typings need to shut the fuck up

import config from "../config";

const stripe = new Stripe(config.stripe.secret, { apiVersion: "2020-03-02" });

export async function createStripeCustomer(paymentMethodId: string, email: string) {
  return await stripe.customers.create({
    payment_method: paymentMethodId,
    email,
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });
}

export async function updateCustomerPaymentMethod(customerId: string, paymentMethodId: string) {
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });
}

export async function getPaymentMethodDetails(paymentMethodId: string) {
  return await stripe.paymentMethods.retrieve(paymentMethodId);
}

// TODO: Redo this? This doesn't really follow the stripe methodology
export async function createCharge(customer: string, payment_method: string, amount: number, description: string) {
  return await stripe.paymentIntents.create({
    customer,
    payment_method,
    description,
    // @ts-ignore
    amount: parseInt(amount * 100),
    confirm: true,
    currency: "usd",
    payment_method_types: ["card"]
  });
}
