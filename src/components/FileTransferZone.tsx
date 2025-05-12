
import React, { useState } from "react";
import { Download, File, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleFileDrop } from "@/utils/fileTransfer";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface FileTransferZoneProps {
  selectedPeerId: string;
  onFilesSelected: (files: any[]) => void;
  className?: string;
}

const FileTransferZone = ({ 
  selectedPeerId, 
  onFilesSelected,
  className 
}: FileTransferZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!selectedPeerId) {
      toast({
        title: "No device selected",
        description: "Please select a device to send files to.",
        variant: "destructive",
      });
      setIsDragging(false);
      return;
    }
    
    const files = handleFileDrop(e, selectedPeerId);
    setIsDragging(false);
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPeerId) {
      toast({
        title: "No device selected",
        description: "Please select a device to send files to.",
        variant: "destructive",
      });
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const filesToSend = Array.from(e.target.files).map(file => ({
        id: `file-${Math.random().toString(36).substring(2, 15)}`,
        file,
        peerId: selectedPeerId,
        progress: 0,
        status: 'pending' as const
      }));
      
      onFilesSelected(filesToSend);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all p-6",
        isDragging 
          ? "border-primary bg-primary/5 transfer-zone" 
          : "border-gray-300 dark:border-gray-700",
        selectedPeerId ? "cursor-pointer" : "cursor-not-allowed opacity-80",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={selectedPeerId ? handleButtonClick : undefined}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileInputChange}
        multiple
      />

      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={cn(
          "rounded-full p-4 bg-primary/10",
          isDragging ? "animate-pulse" : ""
        )}>
          {isDragging ? (
            <Download className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            {isDragging ? "Drop files here" : "Send Files"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedPeerId 
              ? "Drag & drop files or click to browse" 
              : "Select a device first to transfer files"}
          </p>
        </div>

        {!isDragging && (
          <Button 
            variant="outline" 
            size="sm"
            disabled={!selectedPeerId}
            className="mt-2"
          >
            <File className="mr-2 h-4 w-4" />
            Select Files
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileTransferZone;
