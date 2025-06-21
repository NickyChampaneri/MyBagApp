import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBagTypeSchema, 
  insertCarSchema, 
  insertLocationSchema,
  insertBagUsageSchema 
} from "@shared/schema";

// Initialize Stripe only if credentials are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Setup completion route
  app.post('/api/setup/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.updateUserSetupStatus(userId, true);
      res.json(user);
    } catch (error) {
      console.error("Error completing setup:", error);
      res.status(500).json({ message: "Failed to complete setup" });
    }
  });

  // Stripe payment route for one-time payment
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing not configured" });
      }
      const amount = 299; // $2.99 in cents
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          userId: req.user.claims.sub,
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook to handle successful payments
  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing not configured" });
    }
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata.userId;
      
      if (userId) {
        await storage.updateUserPaymentStatus(userId, paymentIntent.customer as string);
      }
    }

    res.json({ received: true });
  });

  // Bag type routes
  app.post('/api/bag-types', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bagTypeData = insertBagTypeSchema.parse(req.body);
      const bagType = await storage.createBagType({ ...bagTypeData, userId });
      res.json(bagType);
    } catch (error) {
      console.error("Error creating bag type:", error);
      res.status(500).json({ message: "Failed to create bag type" });
    }
  });

  app.get('/api/bag-types', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bagTypes = await storage.getUserBagTypes(userId);
      res.json(bagTypes);
    } catch (error) {
      console.error("Error fetching bag types:", error);
      res.status(500).json({ message: "Failed to fetch bag types" });
    }
  });

  // Car routes
  app.post('/api/cars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar({ ...carData, userId });
      res.json(car);
    } catch (error) {
      console.error("Error creating car:", error);
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  app.get('/api/cars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cars = await storage.getUserCars(userId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  // Car bag inventory routes
  app.get('/api/cars/:carId/inventory', isAuthenticated, async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const inventory = await storage.getCarBagInventory(carId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching car inventory:", error);
      res.status(500).json({ message: "Failed to fetch car inventory" });
    }
  });

  app.post('/api/cars/:carId/inventory', isAuthenticated, async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const { bagTypeId, quantity, lowStockThreshold } = req.body;
      const inventory = await storage.setCarBagInventory({
        carId,
        bagTypeId,
        quantity,
        lowStockThreshold: lowStockThreshold || 2,
      });
      res.json(inventory);
    } catch (error) {
      console.error("Error setting car inventory:", error);
      res.status(500).json({ message: "Failed to set car inventory" });
    }
  });

  // Location routes
  app.post('/api/locations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation({ ...locationData, userId });
      res.json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.get('/api/locations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locations = await storage.getUserLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Bag usage routes
  app.post('/api/bag-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usageData = insertBagUsageSchema.parse({ ...req.body, userId });
      const usage = await storage.recordBagUsage(usageData);
      
      // Update car inventory if carId provided
      if (req.body.carId && req.body.bagTypeId) {
        const inventory = await storage.getCarBagInventory(req.body.carId);
        const bagInventory = inventory.find(inv => inv.bagTypeId === req.body.bagTypeId);
        if (bagInventory) {
          const newQuantity = Math.max(0, bagInventory.quantity - req.body.quantity);
          await storage.updateBagQuantity(req.body.carId, req.body.bagTypeId, newQuantity);
        }
      }
      
      res.json(usage);
    } catch (error) {
      console.error("Error recording bag usage:", error);
      res.status(500).json({ message: "Failed to record bag usage" });
    }
  });

  app.get('/api/bag-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getUserBagUsage(userId, 20);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching bag usage:", error);
      res.status(500).json({ message: "Failed to fetch bag usage" });
    }
  });

  // Savings route
  app.get('/api/savings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savings = await storage.getUserSavings(userId);
      res.json(savings);
    } catch (error) {
      console.error("Error fetching savings:", error);
      res.status(500).json({ message: "Failed to fetch savings" });
    }
  });

  // Social sharing route
  app.post('/api/social-share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform, content } = req.body;
      const share = await storage.recordSocialShare({
        userId,
        platform,
        content,
      });
      res.json(share);
    } catch (error) {
      console.error("Error recording social share:", error);
      res.status(500).json({ message: "Failed to record social share" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
