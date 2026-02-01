import { z } from "zod";
import { insertLinkSchema, insertAdSchema, links, ads, sessions } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  expired: z.object({
    message: z.string(),
    code: z.literal("SESSION_EXPIRED")
  })
};

export const api = {
  // Public Flow
  initSession: {
    method: "POST" as const,
    path: "/api/links/:id/init",
    responses: {
      200: z.object({
        sessionId: z.string(),
        step: z.number(),
        expiresAt: z.string()
      }),
      404: errorSchemas.notFound,
    }
  },
  verifyStep: {
    method: "POST" as const,
    path: "/api/session/verify",
    input: z.object({
      sessionId: z.string(),
      step: z.number(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        nextStep: z.number(),
        message: z.string().optional()
      }),
      400: errorSchemas.validation,
      404: errorSchemas.notFound,
      410: errorSchemas.expired
    }
  },
  getFinalUrl: {
    method: "GET" as const,
    path: "/api/session/:sessionId/final",
    responses: {
      200: z.object({
        url: z.string(),
      }),
      403: errorSchemas.unauthorized,
      404: errorSchemas.notFound,
      410: errorSchemas.expired
    }
  },
  getAds: {
    method: "GET" as const,
    path: "/api/ads/public",
    responses: {
      200: z.array(z.custom<typeof ads.$inferSelect>())
    }
  },

  // Admin Routes
  admin: {
    listLinks: {
      method: "GET" as const,
      path: "/api/admin/links",
      responses: {
        200: z.array(z.custom<typeof links.$inferSelect>())
      }
    },
    createLink: {
      method: "POST" as const,
      path: "/api/admin/links",
      input: insertLinkSchema,
      responses: {
        201: z.custom<typeof links.$inferSelect>(),
        400: errorSchemas.validation
      }
    },
    deleteLink: {
      method: "DELETE" as const,
      path: "/api/admin/links/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound
      }
    },
    listAds: {
      method: "GET" as const,
      path: "/api/admin/ads",
      responses: {
        200: z.array(z.custom<typeof ads.$inferSelect>())
      }
    },
    createAd: {
      method: "POST" as const,
      path: "/api/admin/ads",
      input: insertAdSchema,
      responses: {
        201: z.custom<typeof ads.$inferSelect>(),
        400: errorSchemas.validation
      }
    },
    deleteAd: {
      method: "DELETE" as const,
      path: "/api/admin/ads/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type InitSessionResponse = z.infer<typeof api.initSession.responses[200]>;
export type VerifyStepResponse = z.infer<typeof api.verifyStep.responses[200]>;
