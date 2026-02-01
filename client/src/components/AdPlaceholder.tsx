import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  placement: string;
  ads: Array<{ id: number; placement: string; code: string }>;
  className?: string;
  label?: string;
}

export function AdPlaceholder({ placement, ads, className, label = "Advertisement" }: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const relevantAd = ads.find(ad => ad.placement === placement);

  useEffect(() => {
    if (relevantAd && adRef.current) {
      // Very basic script injection handler for the demo
      // In production this needs sanitization and careful handling
      const container = adRef.current;
      container.innerHTML = relevantAd.code;
      
      const scripts = container.getElementsByTagName("script");
      Array.from(scripts).forEach(script => {
        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(script.innerHTML));
        script.parentNode?.replaceChild(newScript, script);
      });
    }
  }, [relevantAd]);

  return (
    <div className={cn("w-full my-6 flex flex-col items-center justify-center", className)}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 opacity-50">
        {label}
      </span>
      <div 
        ref={adRef}
        className="min-h-[100px] w-full max-w-[728px] bg-black/20 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden"
      >
        {!relevantAd && (
          <div className="text-white/10 text-sm font-mono p-4 text-center">
            [Ad Space: {placement}]
          </div>
        )}
      </div>
    </div>
  );
}
