
import { useState } from "react";
import { Computer, Laptop, Monitor, Smartphone, Tablet, Wifi, WifiOff, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Peer = {
  id: string;
  name: string;
  connection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
};

interface PeersListProps {
  peers: Peer[];
  selectedPeerId: string;
  onSelectPeer: (peerId: string) => void;
}

const PeersList = ({ peers, selectedPeerId, onSelectPeer }: PeersListProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Return appropriate icon based on device name
  const getDeviceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("phone") || lowerName.includes("android") || lowerName.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    } else if (lowerName.includes("ipad") || lowerName.includes("tablet")) {
      return <Tablet className="h-4 w-4" />;
    } else if (lowerName.includes("mac") || lowerName.includes("book")) {
      return <Laptop className="h-4 w-4" />;
    } else if (lowerName.includes("tv") || lowerName.includes("monitor")) {
      return <Monitor className="h-4 w-4" />;
    } else if (lowerName.includes("router") || lowerName.includes("network")) {
      return <Wifi className="h-4 w-4" />;
    } else if (lowerName.includes("server") || lowerName.includes("nas")) {
      return <Server className="h-4 w-4" />;
    } else {
      return <Computer className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">Available Devices</h2>
        {peers.length > 0 && (
          <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
            {peers.length}
          </span>
        )}
      </div>
      
      {peers.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-pulse mb-3 flex justify-center">
            <WifiOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Scanning for devices...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure devices are on the same network
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {peers.map((peer) => (
            <Button
              key={peer.id}
              variant={selectedPeerId === peer.id ? "default" : "outline"}
              className={cn(
                "w-full justify-start bg-opacity-80 hover:bg-opacity-100 transition-all",
                selectedPeerId === peer.id ? "bg-primary text-primary-foreground" : "",
                peer.connection ? "border-green-500/30" : ""
              )}
              onClick={() => onSelectPeer(peer.id)}
              onMouseEnter={() => setHoveredId(peer.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {getDeviceIcon(peer.name)}
                  <span className="ml-2 font-medium">{peer.name}</span>
                </div>
                {selectedPeerId === peer.id && (
                  <div className="flex items-center">
                    <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded mr-2">
                      Ready
                    </span>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeersList;
