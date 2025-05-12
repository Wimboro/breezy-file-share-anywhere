
import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  connected: boolean;
  peerCount: number;
  className?: string;
};

const ConnectionStatus = ({ connected, peerCount, className }: ConnectionStatusProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show the component when it mounts with a slight delay for animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 transition-all duration-300", 
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {connected ? (
        <>
          <Wifi className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium">
            Connected{peerCount > 0 ? ` to ${peerCount} device${peerCount !== 1 ? 's' : ''}` : ''}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-500">
            Connecting...
          </span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
