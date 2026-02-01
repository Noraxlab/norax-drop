import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Download, FileCheck, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useFinalUrl } from "@/hooks/use-public";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "@/components/AdPlaceholder";

interface Props {
  linkId: string;
  ads: any[];
}

export default function Step4Download({ linkId, ads }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = useFinalUrl(sessionId);
  const { toast } = useToast();

  useEffect(() => {
    const sid = sessionStorage.getItem("file_share_session");
    if (!sid) {
      setLocation(`/link/${linkId}`);
    } else {
      setSessionId(sid);
    }
  }, [linkId]);

  useEffect(() => {
    if (error) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive"
       });
       // Optional: redirect back if expired
       // setLocation(`/link/${linkId}`);
    }
  }, [error]);

  const handleDownload = () => {
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
      <AdPlaceholder placement="download_top" ads={ads} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="text-center p-8 border-primary/30">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative p-6 bg-black/50 rounded-full border border-primary/30">
                <FileCheck className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-white mb-2">
            File Ready
          </h1>
          <p className="text-muted-foreground mb-8">
            Your secure download link has been generated successfully.
          </p>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6">
              <p>{error.message}</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-white hover:bg-white/10"
                onClick={() => setLocation(`/link/${linkId}`)}
              >
                Restart Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
               <Button
                onClick={handleDownload}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_25px_rgba(124,58,237,0.6)] animate-pulse"
              >
                <Download className="w-6 h-6 mr-2" /> Download Now
              </Button>
              
              <div className="text-xs text-muted-foreground pt-4 border-t border-white/5">
                Link expires in 15 minutes.
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
      
      <AdPlaceholder placement="download_bottom" ads={ads} />
    </div>
  );
}
