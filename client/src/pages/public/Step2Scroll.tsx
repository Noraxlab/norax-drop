import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, CheckCircle2 } from "lucide-react";
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

export default function Step2Scroll({ linkId, ads }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [, setLocation] = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const verifyStep = useVerifyStep();
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrolled(true);
        }
      },
      { threshold: 1.0 }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleVerify = () => {
    const sessionId = sessionStorage.getItem("file_share_session");
    if (!sessionId) {
      setLocation(`/link/${linkId}`);
      return;
    }

    setVerifying(true);
    verifyStep.mutate(
      { sessionId, step: 2 },
      {
        onSuccess: () => {
          setLocation(`/link/${linkId}/security`);
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
    <div className="min-h-screen relative pb-32">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50 shadow-[0_0_10px_var(--primary)]"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-4 pt-12">
        <AdPlaceholder placement="step2_top" ads={ads} />

        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Security Check
          </h1>
          <p className="text-lg text-muted-foreground">
            Please scroll to the bottom of the page to verify you are human.
          </p>
          
          {!scrolled && (
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="mt-8 flex justify-center text-primary"
             >
               <ChevronDown className="w-8 h-8" />
             </motion.div>
          )}
        </div>

        <SeoContent />
        <SeoContent /> {/* Doubled for length */}

        <AdPlaceholder placement="step2_mid" ads={ads} />
        
        <SeoContent />

        <div ref={bottomRef} className="h-10" />
      </div>

      {/* Floating Action Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40"
      >
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleVerify}
            disabled={!scrolled || verifying}
            className={`w-full h-14 text-lg font-medium transition-all duration-300 ${
              scrolled
                ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.5)]" 
                : "bg-white/5 text-white/40 cursor-not-allowed"
            }`}
          >
            {verifying ? (
              "Verifying..."
            ) : scrolled ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Verify & Continue
              </span>
            ) : (
              "Scroll Down to Continue"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
