import { useState } from "react";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check for the MVP as requested
    // In production, this should be a real auth mutation
    if (password === "#*#fileshare#*#*") {
      sessionStorage.setItem("admin_auth", "true");
      setLocation("/admin/dashboard");
      toast({
        title: "Welcome Back",
        description: "Successfully logged in to admin panel."
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white/5 rounded-full mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Access</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter secure key..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/20 border-white/10 text-center font-mono text-sm h-12"
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Authenticate
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
