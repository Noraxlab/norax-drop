import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { randomBytes } from "crypto";

const ADMIN_PASSWORD = "*#*#fileshare#*#*";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Public Routes

  // Init Session (Step 1)
  app.post(api.initSession.path, async (req, res) => {
    try {
      const linkId = req.params.id;
      const link = await storage.getLink(linkId);

      if (!link || !link.active) {
        return res.status(404).json({ message: "Link not found or inactive" });
      }

      // Create session expiring in 30 mins
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const session = await storage.createSession({
        id: randomBytes(16).toString('hex'),
        linkId: link.id,
        expiresAt,
        step: 1
      });

      await storage.incrementLinkViews(link.id);

      res.json({
        sessionId: session.id,
        step: 1,
        expiresAt: session.expiresAt.toISOString()
      });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Verify Step (Step 2/3)
  app.post(api.verifyStep.path, async (req, res) => {
    try {
      const { sessionId, step } = api.verifyStep.input.parse(req.body);
      const session = await storage.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (new Date() > new Date(session.expiresAt)) {
        return res.status(410).json({ message: "Session expired", code: "SESSION_EXPIRED" });
      }

      // Verification Logic
      // In a real app, you might check specific tokens or headers.
      // Here we assume the frontend sent the request after performing the action (scroll, ad view).
      
      await storage.addVerifiedStep(sessionId, step);
      
      // Determine next step
      let nextStep = step + 1;
      
      // Logic for flow:
      // Step 1: Timer (Client side), calls Init
      // Step 2: Scroll -> Verify(2) -> returns nextStep 3
      // Step 3: Ads -> Verify(3) -> returns nextStep 4
      
      await storage.updateSessionStep(sessionId, nextStep);

      res.json({
        success: true,
        nextStep,
        message: "Verification successful"
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Get Final URL (Step 4)
  app.get(api.getFinalUrl.path, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (new Date() > new Date(session.expiresAt)) {
        return res.status(410).json({ message: "Session expired", code: "SESSION_EXPIRED" });
      }

      // Check if steps 2 and 3 are verified
      // (Step 1 is implicit by session existence)
      if (!session.verifiedSteps.includes(2) || !session.verifiedSteps.includes(3)) {
         return res.status(403).json({ message: "Please complete all verification steps" });
      }

      const link = await storage.getLink(session.linkId);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      res.json({ url: link.originalUrl });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.getAds.path, async (req, res) => {
    const ads = await storage.getAds();
    // Filter active ads only
    res.json(ads.filter(a => a.active));
  });

  // Admin Middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    // Simple header check for this MVP as requested
    // In production, use a session or JWT
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
       // Also check cookie for convenience if we implement a login page that sets it
       // But for API simplicity, we'll check header.
       return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // We can also add a login route to help the frontend manage the "auth" state
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  // Admin Routes
  app.get(api.admin.listLinks.path, requireAdmin, async (req, res) => {
    const links = await storage.getLinks();
    res.json(links);
  });

  app.post(api.admin.createLink.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createLink.input.parse(req.body);
      const link = await storage.createLink(input);
      res.status(201).json(link);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.admin.deleteLink.path, requireAdmin, async (req, res) => {
    await storage.deleteLink(req.params.id);
    res.status(204).send();
  });

  app.get(api.admin.listAds.path, requireAdmin, async (req, res) => {
    const ads = await storage.getAds();
    res.json(ads);
  });

  app.post(api.admin.createAd.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createAd.input.parse(req.body);
      const ad = await storage.createAd(input);
      res.status(201).json(ad);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.admin.deleteAd.path, requireAdmin, async (req, res) => {
    await storage.deleteAd(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data
  if ((await storage.getLinks()).length === 0) {
    console.log("Seeding data...");
    await storage.createLink({
      id: "demo",
      originalUrl: "https://replit.com",
      title: "Replit Homepage (Demo)",
      active: true,
      views: 0
    });
    
    await storage.createAd({
      placement: "landing_top",
      code: '<div class="bg-gray-800 p-4 border border-green-500/20 rounded text-center text-green-400">DEMO AD: Top Banner</div>',
      active: true
    });
    
    await storage.createAd({
      placement: "step2",
      code: '<div class="bg-gray-800 p-8 border border-green-500/20 rounded text-center text-green-400 text-xl font-bold">DEMO AD: Step 2 Large Ad</div>',
      active: true
    });
  }

  return httpServer;
}
