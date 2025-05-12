
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Laptop, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import ConnectionStatus from "@/components/ConnectionStatus";
import FileTransferZone from "@/components/FileTransferZone";
import PeersList from "@/components/PeersList";
import TransferProgress from "@/components/TransferProgress";
import peerManager, { FileTransferProgress } from "@/utils/peerConnection";
import { FileToSend, sendFiles } from "@/utils/fileTransfer";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState("");
  const [peers, setPeers] = useState<any[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [filesToSend, setFilesToSend] = useState<FileToSend[]>([]);
  const [transfers, setTransfers] = useState<FileTransferProgress[]>([]);
  const [localPeerInfo, setLocalPeerInfo] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize peer connection manager
    const info = peerManager.init();
    setLocalPeerInfo(info);
    setUserName(info.localPeerName);

    // Setup event listeners
    peerManager.setOnPeersChangeListener((newPeers) => {
      setPeers(newPeers);
      setIsConnected(true);
    });

    peerManager.setOnFileProgressListener((progress) => {
      setTransfers(prev => {
        const existing = prev.findIndex(t => t.fileId === progress.fileId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = progress;
          return updated;
        } else {
          return [...prev, progress];
        }
      });
      
      // Remove completed transfers after some time
      if (progress.complete || progress.error) {
        setTimeout(() => {
          setTransfers(prev => prev.filter(t => t.fileId !== progress.fileId));
        }, 5000);
      }
    });

    // Simulate connection after a delay
    setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    // Clean up on unmount
    return () => {
      peerManager.destroy();
    };
  }, []);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleUserNameSubmit = () => {
    if (userName.trim()) {
      peerManager.setLocalPeerName(userName);
      toast({
        title: "Name Updated",
        description: "Your device name has been updated.",
      });
    }
  };

  const handleSelectPeer = (peerId: string) => {
    setSelectedPeerId(peerId);
    const peer = peers.find(p => p.id === peerId);
    if (peer) {
      toast({
        title: "Device Selected",
        description: `Ready to send files to ${peer.name}.`,
      });
    }
  };

  const handleFilesSelected = (files: FileToSend[]) => {
    setFilesToSend(prev => [...prev, ...files]);
    
    // Start sending files
    sendFiles(files).catch(error => {
      console.error("Error sending files:", error);
      toast({
        title: "Transfer Failed",
        description: "There was an error sending your files.",
        variant: "destructive",
      });
    });
  };

  const handleDismissTransfer = (fileId: string) => {
    setTransfers(prev => prev.filter(t => t.fileId !== fileId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950 dark:via-blue-950 dark:to-purple-950">
      <header className="py-4 px-6 flex justify-between items-center border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Share2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">LocalShare</h1>
        </div>
        <ConnectionStatus 
          connected={isConnected} 
          peerCount={peers.length}
        />
      </header>

      <main className="flex-1 container py-8 max-w-screen-lg mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Your Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Device Name</div>
                    <div className="flex space-x-2">
                      <Input 
                        value={userName} 
                        onChange={handleUserNameChange}
                        placeholder="Enter your device name"
                        className="h-9"
                      />
                      <Button 
                        onClick={handleUserNameSubmit}
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Device ID</div>
                    <div className="text-sm bg-secondary p-2 rounded font-mono truncate">
                      {localPeerInfo?.id || "Generating..."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Laptop className="h-5 w-5 mr-2" />
                  Nearby Devices
                </CardTitle>
                <CardDescription>
                  Select a device to share files with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PeersList 
                  peers={peers}
                  selectedPeerId={selectedPeerId}
                  onSelectPeer={handleSelectPeer}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Files</CardTitle>
                <CardDescription>
                  Transfer files directly to another device on your network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileTransferZone 
                  selectedPeerId={selectedPeerId}
                  onFilesSelected={handleFilesSelected}
                  className="h-64"
                />
                
                {transfers.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <TransferProgress 
                      transfers={transfers}
                      onDismiss={handleDismissTransfer}
                    />
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p>
                    <strong>LocalShare</strong> uses WebRTC technology to create peer-to-peer connections between devices on your local network, allowing for direct file transfers without going through the cloud.
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Ensure both devices are on the same local network</li>
                    <li>Select the device you want to share with</li>
                    <li>Drop files onto the upload area or click to select files</li>
                    <li>Files are transferred directly between devices</li>
                  </ol>
                  
                  <p className="text-muted-foreground">
                    Your files never leave your local network, providing a secure and fast way to share data between your devices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        <p>LocalShare - Secure Local Network File Transfer</p>
      </footer>
    </div>
  );
};

export default Index;
