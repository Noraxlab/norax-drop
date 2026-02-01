import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useInitSession } from "@/hooks/use-public";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "@/components/AdPlaceholder";

interface Props {
  linkId: string;
  ads: any[];
}

export default function Step1Landing({ linkId, ads }: Props) {
  const [countdown, setCountdown] = useState(12);
  const [isReady, setIsReady] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const initSession = useInitSession();

  useEffect(() => {
    // Start session immediately
    initSession.mutate(linkId, {
      onSuccess: (data) => {
        // Store session info
        sessionStorage.setItem("file_share_session", data.sessionId);
        sessionStorage.setItem("file_share_step", String(data.step));
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    });

    // Countdown logic
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [linkId]);

  const handleContinue = () => {
    if (!isReady) return;
    const sessionId = sessionStorage.getItem("file_share_session");
    if (sessionId) {
      setLocation(`/link/${linkId}/verify`);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
      <AdPlaceholder placement="landing_top" ads={ads} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
          
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-display text-white mb-2">Secure Link</h1>
          <p className="text-muted-foreground mb-8">Generating your secure download session...</p>

          <div className="flex justify-center mb-8">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={(12 - countdown) * (100 / 12)}
                text={countdown > 0 ? `${countdown}s` : "Ready"}
                styles={buildStyles({
                  pathColor: "hsl(var(--primary))",
                  textColor: "#fff",
                  trailColor: "rgba(255,255,255,0.1)",
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Virus Scanned</span>
              <span className="w-1 h-1 rounded-full bg-white/20 mx-2" />
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Encrypted</span>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!isReady}
              className={`w-full h-12 text-lg font-medium transition-all duration-300 ${
                isReady 
                  ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.5)]" 
                  : "bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
              }`}
            >
              {isReady ? (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="w-5 h-5" />
                </span>
              ) : (
                "Please Wait..."
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
      
      <AdPlaceholder placement="landing_bottom" ads={ads} />
    </div>
  );
}
