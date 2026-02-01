import { 
  type Link, type InsertLink, 
  type Session, type InsertSession, 
  type Ad, type InsertAd,
  links, sessions, ads
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // Links
  getLink(id: string): Promise<Link | undefined>;
  getLinks(): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  deleteLink(id: string): Promise<void>;
  incrementLinkViews(id: string): Promise<void>;

  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionStep(id: string, step: number): Promise<Session>;
  addVerifiedStep(id: string, step: number): Promise<Session>;

  // Ads
  getAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  deleteAd(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLink(id: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    return link;
  }

  async getLinks(): Promise<Link[]> {
    return await db.select().from(links);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = insertLink.id || randomBytes(4).toString('hex');
    const [link] = await db.insert(links).values({
      ...insertLink,
      id,
      views: 0,
      active: true,
    }).returning();
    return link;
  }

  async deleteLink(id: string): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  }

  async incrementLinkViews(id: string): Promise<void> {
    const link = await this.getLink(id);
    if (link) {
      await db.update(links)
        .set({ views: link.views + 1 })
        .where(eq(links.id, id));
    }
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = insertSession.id || randomBytes(16).toString('hex');
    const [session] = await db.insert(sessions).values({
      ...insertSession,
      id,
      step: 1,
      verifiedSteps: [],
    }).returning();
    return session;
  }

  async updateSessionStep(id: string, step: number): Promise<Session> {
    const [session] = await db.update(sessions)
      .set({ step })
      .where(eq(sessions.id, id))
      .returning();
    if (!session) throw new Error("Session not found");
    return session;
  }

  async addVerifiedStep(id: string, step: number): Promise<Session> {
    const session = await this.getSession(id);
    if (!session) throw new Error("Session not found");
    
    const verifiedSteps = [...session.verifiedSteps];
    if (!verifiedSteps.includes(step)) {
      verifiedSteps.push(step);
    }
    
    const [updatedSession] = await db.update(sessions)
      .set({ verifiedSteps })
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }

  async getAds(): Promise<Ad[]> {
    return await db.select().from(ads);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db.insert(ads).values({
      ...insertAd,
      active: true
    }).returning();
    return ad;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }
}

export const storage = new DatabaseStorage();
