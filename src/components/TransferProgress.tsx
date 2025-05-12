
import { useEffect, useState } from "react";
import { CircleCheck, File as FileIcon, X, FileSpreadsheet, FileText, Image, Music, Video, Archive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileTypeIcon } from "@/utils/fileTransfer";
import { FileTransferProgress } from "@/utils/peerConnection";

interface TransferProgressProps {
  transfers: FileTransferProgress[];
  onDismiss: (fileId: string) => void;
}

const TransferProgress = ({ transfers, onDismiss }: TransferProgressProps) => {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Make newly added transfers visible with animation
    const newVisible = { ...visible };
    transfers.forEach(transfer => {
      if (newVisible[transfer.fileId] === undefined) {
        newVisible[transfer.fileId] = false;
        setTimeout(() => {
          setVisible(prev => ({ ...prev, [transfer.fileId]: true }));
        }, 50);
      }
    });
    setVisible(newVisible);
  }, [transfers]);

  // Get appropriate icon based on file type
  const getIcon = (fileName: string) => {
    const iconType = getFileTypeIcon(fileName);
    
    switch (iconType) {
      case 'file-text':
        return <FileText className="h-4 w-4" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'music':
        return <Music className="h-4 w-4" />;
      case 'archive':
        return <Archive className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  if (transfers.length === 0) return null;

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto p-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        File Transfers ({transfers.length})
      </h3>
      
      {transfers.map((transfer) => (
        <div 
          key={transfer.fileId}
          className={cn(
            "bg-card border rounded-lg p-3 transition-all duration-300 transform",
            visible[transfer.fileId] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-2 truncate">
              {getIcon(transfer.fileName)}
              <span className="text-sm font-medium truncate max-w-[180px]">
                {transfer.fileName}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {transfer.complete && (
                <CircleCheck className="h-4 w-4 text-green-500" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onDismiss(transfer.fileId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{formatFileSize(transfer.size)}</span>
            <span>{Math.round(transfer.progress)}%</span>
          </div>
          
          <Progress 
            value={transfer.progress} 
            className={cn(
              "h-1.5", 
              transfer.complete ? "bg-green-500" : "",
              transfer.error ? "bg-red-500" : ""
            )} 
          />
        </div>
      ))}
    </div>
  );
};

export default TransferProgress;
