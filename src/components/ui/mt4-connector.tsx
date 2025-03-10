
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MountTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const MountTransition: React.FC<MountTransitionProps> = ({
  children,
  delay = 150,
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-opacity duration-500 ease-in-out',
        isMounted ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

type ConnectorStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface MT4ConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

const isElectron = (): boolean => {
  return window.electronAPI !== undefined;
};

export const MT4Connector: React.FC<MT4ConnectorProps> = ({ 
  onConnect, 
  onDisconnect,
  onError 
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectorStatus>('idle');
  const [accountInfo, setAccountInfo] = useState({
    server: '',
    account: '',
    password: ''
  });
  const [watchConfig, setWatchConfig] = useState({
    enabled: false,
    interval: 5, // minutes
    lastCheck: null as Date | null,
    folderPath: '' as string,
    filePattern: '*.csv' as string,
  });
  const watchTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isElectronAvailable] = useState<boolean>(isElectron());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
            handleFileFound(data.path);
          });
          
          window.electronAPI.onFileChanged((data) => {
            handleFileFound(data.path);
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

  const handleFileFound = async (filePath: string) => {
    try {
      if (isElectronAvailable) {
        const result = await window.electronAPI.readFile(filePath);
        if (result.success) {
          toast({
            title: "New Trading Data Found",
            description: `Importing data from ${filePath.split(/[\\/]/).pop()}`,
          });
          
          // Here you would actually parse the file content
          console.log(`File content length: ${result.content.length} bytes`);
          
          // If currently not connected, set to connected
          if (status !== 'connected') {
            setStatus('connected');
            onConnect?.();
          }
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error Processing File",
        description: "Could not process the trading data file.",
        variant: "destructive",
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

  // Select folder using the File System Access API for web or Electron dialog for desktop
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

  // For importing a specific MT4 export file
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      let fileContent: string;
      
      if (isElectronAvailable) {
        // In Electron, we need to use the electron API to read the file
        // The path property is only available in Electron's file object
        // @ts-ignore - path exists in Electron but not in standard web File
        const filePath = file.path;
        if (!filePath) {
          throw new Error("Could not get file path");
        }
        
        const result = await window.electronAPI.readFile(filePath);
        if (result.success) {
          fileContent = result.content;
        } else {
          throw new Error(result.error || "Failed to read file");
        }
      } else {
        // Web fallback
        const reader = new FileReader();
        fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Could not read file"));
          reader.readAsText(file);
        });
      }
      
      // Here we would actually parse the MT4 export file
      console.log(`Successfully read ${file.name} (${fileContent.length} bytes)`);
      
      toast({
        title: "File Imported",
        description: `Successfully imported trading data from ${file.name}`,
      });
      
      if (status !== 'connected') {
        setStatus('connected');
        onConnect?.();
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Import Error",
        description: "Could not parse the MT4 export file.",
        variant: "destructive",
      });
      
      setStatus('error');
      onError?.(new Error('Invalid file format'));
    }
  };

  const handleConnect = () => {
    setStatus('connecting');
    
    // Simulating connection for direct MT4 connection
    setTimeout(() => {
      if (accountInfo.server && accountInfo.account && accountInfo.password) {
        setStatus('connected');
        onConnect?.();
        
        // If folder watching is enabled, start it
        if (watchConfig.enabled && watchConfig.folderPath) {
          startWatchingFolder();
        }
      } else {
        setStatus('error');
        onError?.(new Error('Invalid credentials'));
      }
    }, 2000);
  };

  const handleDisconnect = () => {
    setStatus('idle');
    stopWatchingFolder();
    onDisconnect?.();
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

  // Start or stop watching when config changes
  useEffect(() => {
    if (status === 'connected') {
      if (watchConfig.enabled && watchConfig.folderPath) {
        startWatchingFolder();
      } else {
        stopWatchingFolder();
      }
    }
  }, [watchConfig.enabled, watchConfig.folderPath, watchConfig.interval, status]);

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">MetaTrader 4 Connection</h3>
          <div className="flex items-center">
            {status === 'connected' ? (
              <div className="h-2 w-2 rounded-full bg-profit mr-2"></div>
            ) : status === 'error' ? (
              <div className="h-2 w-2 rounded-full bg-loss mr-2"></div>
            ) : (
              <div className="h-2 w-2 rounded-full bg-neutral mr-2"></div>
            )}
            <span className="text-sm">
              {status === 'idle' && 'Not Connected'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Connected'}
              {status === 'error' && 'Connection Error'}
            </span>
          </div>
        </div>

        {status !== 'connected' && (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="border rounded-md p-3 bg-muted/20">
                <h4 className="font-medium mb-2 text-sm">Import From File</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Import trading data directly from an MT4 export file
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    accept=".csv,.txt,.html,.htm"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                  >
                    Select MT4 Export File
                  </button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 bg-muted/20">
                <h4 className="font-medium mb-2 text-sm">Auto-Import From Folder</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Watch a folder for new MT4 export files and import automatically
                </p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectFolder}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Select Folder
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs truncate">
                        {watchConfig.folderPath ? watchConfig.folderPath : 'No folder selected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm" htmlFor="file-pattern">
                      File Pattern
                    </label>
                    <input
                      id="file-pattern"
                      value={watchConfig.filePattern}
                      onChange={(e) => handleWatchConfigChange('filePattern', e.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-24"
                      placeholder="*.csv"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm" htmlFor="watch-interval">
                      Check Interval (minutes)
                    </label>
                    <select
                      id="watch-interval"
                      value={watchConfig.interval}
                      onChange={(e) => handleWatchConfigChange('interval', parseInt(e.target.value))}
                      className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="1">1</option>
                      <option value="5">5</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="60">60</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enable-watch"
                      checked={watchConfig.enabled}
                      onChange={(e) => handleWatchConfigChange('enabled', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label className="text-sm" htmlFor="enable-watch">
                      Enable automatic importing
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-1">
              <h4 className="font-medium mb-2 text-sm">Direct MT4 Connection</h4>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <label className="text-sm font-medium" htmlFor="server">
                    MT4 Server
                  </label>
                  <input
                    id="server"
                    name="server"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={accountInfo.server}
                    onChange={handleChange}
                    placeholder="broker.mt4server.com"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium" htmlFor="account">
                    Account Number
                  </label>
                  <input
                    id="account"
                    name="account"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={accountInfo.account}
                    onChange={handleChange}
                    placeholder="12345678"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={accountInfo.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : status === 'error' ? (
                'Retry Connection'
              ) : (
                'Connect to MT4'
              )}
            </button>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Server:</span>
              <span className="font-medium">{accountInfo.server || "File Import"}</span>
            </div>
            {accountInfo.account && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">****{accountInfo.account.slice(-4)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            
            {watchConfig.enabled && watchConfig.folderPath && (
              <div className="border rounded-md p-3 bg-muted/20 mt-2">
                <h4 className="font-medium mb-2 text-sm">Folder Watch Active</h4>
                <div className="text-xs grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Folder:</span>
                    <span className="font-medium truncate max-w-[180px]">{watchConfig.folderPath}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pattern:</span>
                    <span className="font-medium">{watchConfig.filePattern}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check Interval:</span>
                    <span className="font-medium">{watchConfig.interval} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Check:</span>
                    <span className="font-medium">
                      {watchConfig.lastCheck ? watchConfig.lastCheck.toLocaleTimeString() : 'Not checked yet'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Check:</span>
                    <span className="font-medium">
                      {watchConfig.lastCheck 
                        ? new Date(watchConfig.lastCheck.getTime() + watchConfig.interval * 60000).toLocaleTimeString()
                        : 'Soon'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleDisconnect}
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
