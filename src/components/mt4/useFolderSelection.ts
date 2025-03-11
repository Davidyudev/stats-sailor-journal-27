
import { useToast } from '@/hooks/use-toast';
import { isElectron, WatchConfig } from './utils';

export const useFolderSelection = (
  setWatchConfig: (updater: (prev: WatchConfig) => WatchConfig) => void
) => {
  const { toast } = useToast();
  const isElectronAvailable = isElectron();

  const handleSelectFolder = async () => {
    try {
      let folderPath = '';
      let folderName = '';
      
      if (isElectronAvailable) {
        const result = await window.electronAPI.selectFolder();
        if (!result.canceled) {
          folderPath = result.filePath;
          folderName = folderPath.split(/[\\/]/).pop() || '';
          
          setWatchConfig(prev => ({
            ...prev,
            folderPath
          }));
          
          toast({
            title: "Folder Selected",
            description: `Selected folder: ${folderName}`,
          });
        }
      } else {
        // Fallback for web - using FileSystem Access API if available
        try {
          // @ts-ignore - FileSystemDirectoryHandle is not in the TypeScript DOM types yet
          const directoryHandle = await window.showDirectoryPicker({
            mode: 'read'
          });
          
          folderName = directoryHandle.name;
          folderPath = folderName; // Just use the name as a placeholder in web version
          
          setWatchConfig(prev => ({
            ...prev,
            folderPath
          }));
          
          toast({
            title: "Folder Selected",
            description: `Selected folder: ${folderName}`,
          });
        } catch (error) {
          console.error("Error selecting folder:", error);
          // User probably canceled the dialog
          if ((error as Error).name !== 'AbortError') {
            toast({
              title: "Error Selecting Folder",
              description: "Could not select folder. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      toast({
        title: "Error",
        description: "Failed to select folder.",
        variant: "destructive",
      });
    }
  };

  return { handleSelectFolder };
};
