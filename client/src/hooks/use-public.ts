import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type VerifyStepResponse, type InitSessionResponse } from "@shared/routes";
import { z } from "zod";

export function useInitSession() {
  return useMutation({
    mutationFn: async (linkId: string) => {
      const url = buildUrl(api.initSession.path, { id: linkId });
      const res = await fetch(url, { 
        method: api.initSession.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Link not found");
        throw new Error("Failed to initialize session");
      }
      
      return api.initSession.responses[200].parse(await res.json());
    }
  });
}

export function useVerifyStep() {
  return useMutation({
    mutationFn: async (data: { sessionId: string; step: number }) => {
      const validated = api.verifyStep.input.parse(data);
      const res = await fetch(api.verifyStep.path, {
        method: api.verifyStep.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        if (res.status === 410) throw new Error("Session expired");
        throw new Error(error.message || "Verification failed");
      }

      return api.verifyStep.responses[200].parse(await res.json());
    }
  });
}

export function useFinalUrl(sessionId: string | null) {
  return useQuery({
    queryKey: [api.getFinalUrl.path, sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const url = buildUrl(api.getFinalUrl.path, { sessionId });
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        if (res.status === 410) throw new Error("Session expired");
        if (res.status === 403) throw new Error("Unauthorized access");
        throw new Error("Failed to get URL");
      }

      return api.getFinalUrl.responses[200].parse(await res.json());
    },
    enabled: !!sessionId,
    retry: false
  });
}

export function useAds() {
  return useQuery({
    queryKey: [api.getAds.path],
    queryFn: async () => {
      const res = await fetch(api.getAds.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ads");
      return api.getAds.responses[200].parse(await res.json());
    }
  });
}
