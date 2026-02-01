import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateLinkRequest, type CreateAdRequest } from "@shared/routes";

export function useAdminLinks() {
  return useQuery({
    queryKey: [api.admin.listLinks.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listLinks.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch links");
      return api.admin.listLinks.responses[200].parse(await res.json());
    }
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLinkRequest) => {
      const validated = api.admin.createLink.input.parse(data);
      const res = await fetch(api.admin.createLink.path, {
        method: api.admin.createLink.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include"
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create link");
      }
      
      return api.admin.createLink.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listLinks.path] });
    }
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.admin.deleteLink.path, { id });
      const res = await fetch(url, { 
        method: api.admin.deleteLink.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete link");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listLinks.path] });
    }
  });
}

export function useAdminAds() {
  return useQuery({
    queryKey: [api.admin.listAds.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listAds.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ads");
      return api.admin.listAds.responses[200].parse(await res.json());
    }
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAdRequest) => {
      const validated = api.admin.createAd.input.parse(data);
      const res = await fetch(api.admin.createAd.path, {
        method: api.admin.createAd.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to create ad");
      
      return api.admin.createAd.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listAds.path] });
    }
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.deleteAd.path, { id });
      const res = await fetch(url, { 
        method: api.admin.deleteAd.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete ad");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listAds.path] });
    }
  });
}
