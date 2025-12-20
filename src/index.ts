import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response } from "express";
import listingRoutes from './routes/listingRoutes';
import messageRoutes from './routes/messageRoutes';
import conversationRoutes from './routes/conversationRoutes';
import profileRoutes from './routes/profileRoutes';
import takeoverattempts from './routes/takeoverattempts';
import notificationRoutes from "./routes/notificationRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import path from "path";
import http from 'http';
import passport from "./config/passport";

import cookieParser from "cookie-parser";

import cors from 'cors';
import db from './models';

import { initSocket } from "./socket";
import Stripe from 'stripe';
import { Takeoverattempts } from './models/Takeoverattempts';
import { Listing } from './models/Listing';
import { pushNotification } from './services/notificationService';
import { sendEmail } from './utils/mailer';
import { sendEmails } from "./utils/sendEmail";
import { User } from './models/User';

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover',
});

app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("webhook lestning..");
    
    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("❌ Stripe verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Payment successful:", session);
        // ✅ Retrieve metadata values

        if (session.metadata?.title === "Listing Fee") {
          const lease_id = session.metadata?.lease_id;
          const lease = await Listing.findByPk(lease_id);
          if (!lease) return res.status(404).json({ error: "lease not found" });
          lease.status = "active"

          await lease.save();

          const user = await User.findByPk(lease.userId)
          // 🎯 Send notification to the creator
          await pushNotification({
            recipientId: lease.userId,
            type: "takeover_applied", // or you can create a new type like "listing_created"
            title: "Listing Posted Successfully",
            message: `Your listing "${lease.title}" has been created and published successfully.`,
          });

          sendEmail(user?.email || "", "publish_listing", { username: user?.name, title: lease.title, lease_id: lease_id })

        } else {
          const takeover_id = session.metadata?.takeover_id;

          const takeover = await Takeoverattempts.findByPk(takeover_id);
          if (!takeover) return res.status(404).json({ error: "Takeover not found" });

          // Proceed with the takeover process
          // ...
          takeover.status = "proceeding";

          takeover.paymentData = {
            sessionId: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            payment_date: new Date(),
          }
          await takeover.save();

          const user = await User.findByPk(takeover.userId)
          const lease = await Listing.findByPk(takeover.listingId)
          const tenant = await User.findByPk(lease?.userId)

          // for the takeoverer
          await pushNotification({
            recipientId: takeover.userId,
            type: "takeover_applied", // or you can create a new type like "listing_created"
            title: "Takeover proceeded Successfully",
            message: `You are successfuly proceeding with listing "${lease?.title}", wait for acceptance by the tenant.`,
          });

          sendEmail(user?.email || "", "proceed_takeoverer", { username: user?.name, title: lease?.title })

          // for the tenant
          await pushNotification({
            recipientId: Number(lease?.userId),
            type: "takeover_applied", // or you can create a new type like "listing_created"
            title: "Takeover Attempt Found",
            message: `User ${user?.name} have proceeded for Your listing "${lease?.title}", review and Aceept the user to go further with the takeover.`,
          });

          sendEmail(tenant?.email || "", "proceed_tenant", { username: user?.name, tenant: tenant?.name, title: lease?.title, lease_id: takeover.listingId })
        }
        break;
      case "payment_intent.succeeded":

        const session2 = event.data.object as Stripe.PaymentIntent;
        console.log("✅ Payment successful:", session2);
        // ✅ Retrieve metadata values

        if (session2.metadata?.title === "Listing Fee") {
          const lease_id = session2.metadata?.lease_id;
          const lease = await Listing.findByPk(lease_id);
          if (!lease) return res.status(404).json({ error: "lease not found" });
          lease.status = "active"

          await lease.save();

        } else {
          const takeover_id = session2.metadata?.takeover_id;

          const takeover = await Takeoverattempts.findByPk(takeover_id);
          if (!takeover) return res.status(404).json({ error: "Takeover not found" });

          // Proceed with the takeover process
          
          takeover.status = "proceeding";

          takeover.paymentData = {
            session2Id: session2.id,
            amount_total: 10,
            currency: session2.currency,
            payment_date: new Date(),
          }
          await takeover.save(); 
        }    

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ✅ parse cookies
app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
  origin: [ process.env.FRONTEND_URL as string,  'https://website-takeover.onrender.com', 'http://192.168.1.2:5173', 'http://localhost:8081', 'http://localhost:19006', 'http://192.168.1.2:19000', 'https://www.takeovermobile.com/'], // React Vite frontend
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working 🚀');
});

app.set("trust proxy", 1);
//routes
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes); // Assuming you have messageRoutes defined similarly to listingRoute
app.use('/api/conversations', conversationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/takeover', takeoverattempts);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/users", authRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/profiles", express.static(path.join(__dirname, "profiles")));
app.get("/smtp-test", async (req: Request, res: Response): Promise<void> => {
  try {
    await sendEmails({
      to: "abdulsomed0825@gmail.com",
      subject: "SMTP Test",
      html: "<h1>Working</h1>"
    });

    res.status(200).json({ message: "SMTP is working" });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    res.status(500).json({ error: errorMessage });
  }
});


const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  try {
    await db.sequelize.sync({ alter: true }); // Auto-sync models
    
    console.log('Connected to DB 🐘');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('DB connection error:', err);
    
  }
};

start();


