import { toast } from "@/components/ui/use-toast";

type PeerData = {
  id: string;
  name: string;
  connection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
};

export type FileMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  senderId: string;
};

export type FileTransferProgress = {
  fileId: string;
  fileName: string;
  progress: number;
  complete: boolean;
  error: boolean;
  size: number;
};

class PeerConnectionManager {
  private peers: Map<string, PeerData> = new Map();
  private localPeerId: string = "";
  private localPeerName: string = "";
  private onPeersChange: ((peers: PeerData[]) => void) | null = null;
  private onFileReceive: ((file: File) => void) | null = null;
  private onFileProgress: ((progress: FileTransferProgress) => void) | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private discoveryInterval: number | null = null;

  constructor() {
    this.localPeerId = this.generateId();
    const storedName = localStorage.getItem('localPeerName');
    this.localPeerName = storedName || `Device-${Math.floor(Math.random() * 1000)}`;
  }

  init() {
    console.log("PeerConnectionManager initialized");
    
    // Set up peer connection
    this.setupPeerDiscovery();
    
    // Return local peer info with consistent property names
    return {
      id: this.localPeerId,
      name: this.localPeerName
    };
  }

  private setupPeerDiscovery() {
    // In a real implementation, this would use WebRTC and a signaling server
    // For now, we'll simulate network discovery with local network scan
    
    // Clear any existing discovery interval
    if (this.discoveryInterval) {
      window.clearInterval(this.discoveryInterval);
    }
    
    // Start discovery process
    this.scanLocalNetwork();
    
    // Set up regular scanning
    this.discoveryInterval = window.setInterval(() => {
      this.scanLocalNetwork();
    }, 10000); // Scan every 10 seconds
  }
  
  private scanLocalNetwork() {
    console.log("Scanning local network for devices...");
    
    // In a real app, this would use mDNS or a discovery service
    // For this demo, we'll simulate finding devices
    
    // Get device info from the browser
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Generate nearby devices based on current browser environment
    const nearbyDevices = [];
    
    // Add a device representing the user's current platform
    if (platform.includes("Win")) {
      nearbyDevices.push({ id: "nearby-win-" + Math.random().toString(36).substring(2, 8), name: "Windows PC" });
    } else if (platform.includes("Mac")) {
      nearbyDevices.push({ id: "nearby-mac-" + Math.random().toString(36).substring(2, 8), name: "MacBook" });
    } else if (platform.includes("Linux")) {
      nearbyDevices.push({ id: "nearby-linux-" + Math.random().toString(36).substring(2, 8), name: "Linux Workstation" });
    }
    
    // Add a mobile device if we detect one in the network
    if (isMobile) {
      if (userAgent.includes("iPhone")) {
        nearbyDevices.push({ id: "nearby-ios-" + Math.random().toString(36).substring(2, 8), name: "iPhone" });
      } else if (userAgent.includes("iPad")) {
        nearbyDevices.push({ id: "nearby-ipad-" + Math.random().toString(36).substring(2, 8), name: "iPad" });
      } else if (userAgent.includes("Android")) {
        nearbyDevices.push({ id: "nearby-android-" + Math.random().toString(36).substring(2, 8), name: "Android Phone" });
      }
    }
    
    // Add one more random device type to simulate a network with multiple devices
    const randomDeviceTypes = [
      { id: "nearby-router-" + Math.random().toString(36).substring(2, 8), name: "Network Router" },
      { id: "nearby-nas-" + Math.random().toString(36).substring(2, 8), name: "NAS Drive" },
      { id: "nearby-tv-" + Math.random().toString(36).substring(2, 8), name: "Smart TV" }
    ];
    nearbyDevices.push(randomDeviceTypes[Math.floor(Math.random() * randomDeviceTypes.length)]);
    
    // Update the peers map with the discovered devices
    nearbyDevices.forEach(device => {
      if (!this.peers.has(device.id)) {
        this.peers.set(device.id, {
          id: device.id,
          name: device.name,
          connection: null,
          dataChannel: null
        });
      }
    });
    
    // Notify listeners about the updated peers list
    if (this.onPeersChange) {
      this.onPeersChange(this.getPeers());
    }
  }

  generateId(): string {
    return `peer-${Math.random().toString(36).substring(2, 15)}`;
  }

  getPeers(): PeerData[] {
    return Array.from(this.peers.values());
  }

  getLocalPeerInfo() {
    return {
      id: this.localPeerId,
      name: this.localPeerName
    };
  }

  setLocalPeerName(name: string) {
    this.localPeerName = name;
    // Store name in local storage for persistence
    localStorage.setItem('localPeerName', name);
  }

  setOnPeersChangeListener(callback: (peers: PeerData[]) => void) {
    this.onPeersChange = callback;
    // Call immediately with current peers
    if (this.peers.size > 0) {
      callback(this.getPeers());
    }
  }

  setOnFileReceiveListener(callback: (file: File) => void) {
    this.onFileReceive = callback;
  }

  setOnFileProgressListener(callback: (progress: FileTransferProgress) => void) {
    this.onFileProgress = callback;
  }

  // Simulate sending a file to a peer
  sendFile(peerId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const peer = this.peers.get(peerId);
      if (!peer) {
        reject(new Error("Peer not found"));
        return;
      }

      const fileId = `file-${Math.random().toString(36).substring(2, 15)}`;
      const fileMeta: FileMeta = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        senderId: this.localPeerId
      };

      // Simulate file transfer progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          if (this.onFileProgress) {
            this.onFileProgress({
              fileId,
              fileName: file.name,
              progress: 100,
              complete: true,
              error: false,
              size: file.size
            });
          }
          
          toast({
            title: "File Transfer Complete",
            description: `${file.name} was sent successfully to ${peer.name}.`,
          });
          
          resolve();
        } else {
          if (this.onFileProgress) {
            this.onFileProgress({
              fileId,
              fileName: file.name,
              progress,
              complete: false,
              error: false,
              size: file.size
            });
          }
        }
      }, 400);
    });
  }

  // Clean up connections when component unmounts
  destroy() {
    if (this.discoveryInterval) {
      window.clearInterval(this.discoveryInterval);
    }
    
    this.peers.forEach(peer => {
      if (peer.connection) {
        peer.connection.close();
      }
    });
    
    this.peers.clear();
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}

// Singleton instance
const peerManager = new PeerConnectionManager();
export default peerManager;
