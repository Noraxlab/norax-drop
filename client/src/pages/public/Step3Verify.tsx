import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useVerifyStep } from "@/hooks/use-public";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { SeoContent } from "@/components/SeoContent";

interface Props {
  linkId: string;
  ads: any[];
}

export default function Step3Verify({ linkId, ads }: Props) {
  const [canVerify, setCanVerify] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [, setLocation] = useLocation();
  const verifyStep = useVerifyStep();
  const { toast } = useToast();

  useEffect(() => {
    // Artificial delay for "Ad Verification"
    const timer = setTimeout(() => {
      setCanVerify(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    const sessionId = sessionStorage.getItem("file_share_session");
    if (!sessionId) {
      setLocation(`/link/${linkId}`);
      return;
    }

    setVerifying(true);
    verifyStep.mutate(
      { sessionId, step: 3 },
      {
        onSuccess: () => {
          setLocation(`/link/${linkId}/download`);
        },
        onError: (err) => {
          setVerifying(false);
          toast({
            title: "Verification Failed",
            description: err.message,
            variant: "destructive"
          });
          if (err.message.includes("expired")) {
             setLocation(`/link/${linkId}`);
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <AdPlaceholder placement="step3_top" ads={ads} />

        <GlassCard className="mb-12 text-center p-8">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Final Verification
          </h1>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            We are performing a final security check on your connection. 
            This usually takes a few seconds. Please review the sponsored content below.
          </p>

          <div className="max-w-md mx-auto bg-black/40 rounded-xl p-4 border border-white/5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Security Status</span>
              <span className="text-sm text-green-400 font-mono">SCANNING...</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 5, ease: "linear" }}
                 className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
               />
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!canVerify || verifying}
            className={`w-full max-w-md h-12 text-lg font-medium transition-all duration-300 ${
              canVerify
                ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.5)]" 
                : "bg-white/5 text-white/40 cursor-not-allowed"
            }`}
          >
            {verifying ? "Verifying..." : canVerify ? (
              <span className="flex items-center gap-2">
                Continue to Download <ArrowRight className="w-5 h-5" />
              </span>
            ) : (
              "Please wait..."
            )}
          </Button>
        </GlassCard>

        <AdPlaceholder placement="step3_mid" ads={ads} />
        
        <SeoContent />
        
        <AdPlaceholder placement="step3_bottom" ads={ads} />
      </div>
    </div>
  );
}
