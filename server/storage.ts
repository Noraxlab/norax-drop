import { 
  type Link, type InsertLink, 
  type Session, type InsertSession, 
  type Ad, type InsertAd 
} from "@shared/schema";
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

export class MemStorage implements IStorage {
  private links: Map<string, Link>;
  private sessions: Map<string, Session>;
  private ads: Map<number, Ad>;
  private adIdCounter: number;

  constructor() {
    this.links = new Map();
    this.sessions = new Map();
    this.ads = new Map();
    this.adIdCounter = 1;
  }

  // Links
  async getLink(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async getLinks(): Promise<Link[]> {
    return Array.from(this.links.values());
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = insertLink.id || randomBytes(4).toString('hex');
    const link: Link = {
      ...insertLink,
      id,
      views: 0,
      active: true,
      createdAt: new Date()
    };
    this.links.set(id, link);
    return link;
  }

  async deleteLink(id: string): Promise<void> {
    this.links.delete(id);
  }

  async incrementLinkViews(id: string): Promise<void> {
    const link = this.links.get(id);
    if (link) {
      link.views++;
      this.links.set(id, link);
    }
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = insertSession.id || randomBytes(16).toString('hex');
    const session: Session = {
      ...insertSession,
      id,
      step: 1,
      verifiedSteps: [],
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSessionStep(id: string, step: number): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Session not found");
    
    session.step = step;
    this.sessions.set(id, session);
    return session;
  }

  async addVerifiedStep(id: string, step: number): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Session not found");
    
    if (!session.verifiedSteps.includes(step)) {
      session.verifiedSteps.push(step);
    }
    this.sessions.set(id, session);
    return session;
  }

  // Ads
  async getAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = this.adIdCounter++;
    const ad: Ad = {
      ...insertAd,
      id,
      active: true
    };
    this.ads.set(id, ad);
    return ad;
  }

  async deleteAd(id: number): Promise<void> {
    this.ads.delete(id);
  }
}

export const storage = new MemStorage();
