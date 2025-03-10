
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WatchConfig, isElectron } from './utils';

export const useFileWatch = (
  onFileFound: (filePath: string) => void
) => {
  const { toast } = useToast();
  const [watchConfig, setWatchConfig] = useState<WatchConfig>({
    enabled: false,
    interval: 5, // minutes
    lastCheck: null,
    folderPath: '',
    filePattern: '*.csv',
  });
  const watchTimerRef = useRef<number | null>(null);
  const isElectronAvailable = isElectron();

  const handleWatchConfigChange = (name: string, value: any) => {
    setWatchConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startWatchingFolder = async () => {
    if (!watchConfig.enabled || !watchConfig.folderPath) return;
    
    if (isElectronAvailable) {
      try {
        const result = await window.electronAPI.startWatchingFolder(
          watchConfig.folderPath, 
          watchConfig.filePattern
        );
        
        if (result.success) {
          toast({
            title: "Folder Watch Started",
            description: `Watching ${watchConfig.folderPath} for ${watchConfig.filePattern} files.`,
          });
          
          // Set up file found callback
          window.electronAPI.onFileFound((data) => {
            onFileFound(data.path);
          });
          
          window.electronAPI.onFileChanged((data) => {
            onFileFound(data.path);
          });
        } else {
          toast({
            title: "Error Starting File Watch",
            description: result.error || "Could not watch the selected folder.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error starting folder watch:", error);
        toast({
          title: "Error",
          description: "Failed to start folder watch.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to timer-based checking for web
      if (watchTimerRef.current) {
        window.clearInterval(watchTimerRef.current);
      }
      
      // Set up a new timer
      watchTimerRef.current = window.setInterval(() => {
        checkFolderForUpdates();
      }, watchConfig.interval * 60 * 1000); // Convert minutes to milliseconds
      
      toast({
        title: "Folder Watch Started",
        description: `Watching ${watchConfig.folderPath} every ${watchConfig.interval} minutes.`,
      });
    }
    
    setWatchConfig(prev => ({
      ...prev,
      lastCheck: new Date()
    }));
  };

  const stopWatchingFolder = async () => {
    if (isElectronAvailable) {
      try {
        await window.electronAPI.stopWatchingFolder();
        window.electronAPI.removeAllListeners('file-found');
        window.electronAPI.removeAllListeners('file-changed');
        
        toast({
          title: "Folder Watch Stopped",
          description: "No longer watching folder for updates.",
        });
      } catch (error) {
        console.error("Error stopping folder watch:", error);
      }
    } else if (watchTimerRef.current) {
      window.clearInterval(watchTimerRef.current);
      watchTimerRef.current = null;
      
      toast({
        title: "Folder Watch Stopped",
        description: "No longer watching folder for updates.",
      });
    }
  };

  const checkFolderForUpdates = async () => {
    try {
      setWatchConfig(prev => ({
        ...prev,
        lastCheck: new Date()
      }));
      
      // For web version, this is just a simulated check
      if (!isElectronAvailable) {
        console.log(`Checking folder ${watchConfig.folderPath} for updates...`);
        
        // Simulate finding new files occasionally
        if (Math.random() > 0.7) {
          toast({
            title: "New Trading Data Found",
            description: "Importing new trading data from MT4 export.",
          });
        }
      }
    } catch (error) {
      console.error("Error checking folder for updates:", error);
      toast({
        title: "Error Checking Folder",
        description: "Could not check folder for updates.",
        variant: "destructive",
      });
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (watchTimerRef.current) {
        window.clearInterval(watchTimerRef.current);
      }
      
      if (isElectronAvailable) {
        window.electronAPI.removeAllListeners('file-found');
        window.electronAPI.removeAllListeners('file-changed');
      }
    };
  }, [isElectronAvailable]);

  return {
    watchConfig,
    setWatchConfig, // Export the setWatchConfig function
    handleWatchConfigChange,
    startWatchingFolder,
    stopWatchingFolder,
    checkFolderForUpdates,
  };
};
