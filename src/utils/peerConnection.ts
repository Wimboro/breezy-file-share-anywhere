
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

  constructor() {
    this.localPeerId = this.generateId();
    this.localPeerName = `User-${Math.floor(Math.random() * 1000)}`;
  }

  init() {
    // In a real app, this would initialize WebRTC connections
    console.log("PeerConnectionManager initialized");
    
    // For demo purposes, create some mock peers
    this.addMockPeers();
    
    return {
      localPeerId: this.localPeerId,
      localPeerName: this.localPeerName
    };
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

  // Add some mock peers for demonstration purposes
  private addMockPeers() {
    const mockPeers = [
      { id: "peer-abc123", name: "MacBook Pro" },
      { id: "peer-def456", name: "Windows Desktop" },
      { id: "peer-ghi789", name: "Android Phone" }
    ];

    setTimeout(() => {
      mockPeers.forEach(peer => {
        this.peers.set(peer.id, {
          id: peer.id,
          name: peer.name,
          connection: null,
          dataChannel: null
        });
      });
      
      if (this.onPeersChange) {
        this.onPeersChange(this.getPeers());
      }
    }, 2000);
  }

  // Clean up connections when component unmounts
  destroy() {
    this.peers.forEach(peer => {
      if (peer.connection) {
        peer.connection.close();
      }
    });
    this.peers.clear();
  }
}

// Singleton instance
const peerManager = new PeerConnectionManager();
export default peerManager;
