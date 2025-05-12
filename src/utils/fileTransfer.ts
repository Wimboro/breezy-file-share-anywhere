
import { toast } from "@/components/ui/use-toast";
import peerManager, { FileMeta, FileTransferProgress } from "./peerConnection";

export type FileToSend = {
  id: string;
  file: File;
  peerId: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return 'file-text';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'xls':
    case 'xlsx':
      return 'file-spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'file-presentation';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return 'image';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'music';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'archive';
    default:
      return 'file';
  }
}

export function handleFileDrop(e: React.DragEvent, selectedPeerId: string): FileToSend[] {
  e.preventDefault();
  e.stopPropagation();

  const filesToSend: FileToSend[] = [];
  
  if (e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        const file = e.dataTransfer.items[i].getAsFile();
        if (file) {
          filesToSend.push({
            id: `file-${Math.random().toString(36).substring(2, 15)}`,
            file,
            peerId: selectedPeerId,
            progress: 0,
            status: 'pending'
          });
        }
      }
    }
  } else if (e.dataTransfer.files) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      filesToSend.push({
        id: `file-${Math.random().toString(36).substring(2, 15)}`,
        file,
        peerId: selectedPeerId,
        progress: 0,
        status: 'pending'
      });
    }
  }
  
  return filesToSend;
}

export function sendFiles(files: FileToSend[]): Promise<void[]> {
  if (files.length === 0) {
    return Promise.resolve([]);
  }
  
  // Create a toast notification
  toast({
    title: "Sending files",
    description: `Starting transfer of ${files.length} file${files.length > 1 ? 's' : ''}...`,
  });

  // Map each file to a promise that sends it
  const sendPromises = files.map(fileToSend => 
    peerManager.sendFile(fileToSend.peerId, fileToSend.file)
  );
  
  return Promise.all(sendPromises);
}
