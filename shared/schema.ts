import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const links = pgTable("links", {
  id: text("id").primaryKey(), // This will be the slug/secure ID
  originalUrl: text("original_url").notNull(),
  title: text("title").notNull(),
  views: integer("views").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull(), // References links.id
  step: integer("step").default(1).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedSteps: jsonb("verified_steps").$type<number[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  placement: text("placement").notNull(), // e.g., 'landing_top', 'landing_bottom', 'step2', 'step3', 'video_placeholder'
  code: text("code").notNull(),
  active: boolean("active").default(true).notNull(),
});

// Schemas
export const insertLinkSchema = createInsertSchema(links).omit({ 
  createdAt: true, 
  views: true 
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ 
  createdAt: true,
  verifiedSteps: true
});

export const insertAdSchema = createInsertSchema(ads).omit({ 
  id: true 
});

// Types
export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;

// Request Types
export type CreateLinkRequest = InsertLink;
export type CreateAdRequest = InsertAd;
export type VerifyStepRequest = {
  sessionId: string;
  step: number;
  token?: string; // Optional specific verification token
};
