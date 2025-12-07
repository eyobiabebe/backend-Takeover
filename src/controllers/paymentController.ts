import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover',
});

export const createTekeoverPayment = async (req: Request, res: Response) => {
  try {
    const { leaseId, price, title, takeover_id, type } = req.body;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${title}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      // ✅ Attach takeover_id in metadata
      metadata: {
        takeover_id: takeover_id.toString(),
        lease_id: leaseId.toString(),
        title: title,
        type: type,
      },
      success_url: `${process.env.FRONTEND_URL}/success/${type}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel/${type}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

export const createListingPayment = async (req: Request, res: Response) => {
  try {
    const { listingId, price, title, type } = req.body;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${title}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      // ✅ Attach takeover_id in metadata
      metadata: {
        title: title,
        lease_id: listingId.toString(),
        type: type,
      },
      success_url: `${process.env.FRONTEND_URL}/success/${type}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel/${type}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Payment initialization failed" + error });
  }
};

export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log("Payment successful:", session);
      // TODO: Fulfill the purchase
      break;
    default:
      console.warn("Unhandled event type:", event.type);
  }

  res.json({ received: true });
};

// for mobile app

export const createTakeoverIntent = async (req: Request, res: Response) => {
  try {
    const { takeover_id, leaseId, price, title, type } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        takeover_id: takeover_id?.toString(),
        lease_id: leaseId?.toString(),
        title,
        type,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

export const createListingIntent = async (req: Request, res: Response) => {
  try {
    const { listingId, price, title, type } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        lease_id: listingId?.toString(),
        title: title,
        type: type,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};
