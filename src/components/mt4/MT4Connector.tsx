
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AccountInfo, ConnectorStatus, isElectron } from './utils';
import { MountTransition } from './MountTransition';
import { ConnectionForm } from './ConnectionForm';
import { FileImport } from './FileImport';
import { FolderWatch } from './FolderWatch';
import { ConnectedStatus } from './ConnectedStatus';
import { useFileWatch } from './useFileWatch';
import { useFolderSelection } from './useFolderSelection';
import { useFileHandling } from './useFileHandling';

interface MT4ConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const MT4Connector: React.FC<MT4ConnectorProps> = ({ 
  onConnect, 
  onDisconnect,
  onError 
}) => {
  const [status, setStatus] = useState<ConnectorStatus>('idle');
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    server: '',
    account: '',
    password: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isElectronAvailable] = useState<boolean>(isElectron());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setConnected = () => {
    if (status !== 'connected') {
      setStatus('connected');
      onConnect?.();
    }
  };

  const { 
    handleFileFound, 
    handleFileImport 
  } = useFileHandling(
    setConnected,
    onError
  );

  const { 
    watchConfig, 
    handleWatchConfigChange,
    startWatchingFolder,
    stopWatchingFolder
  } = useFileWatch(handleFileFound);

  const { handleSelectFolder } = useFolderSelection(setWatchConfig);

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
              <FileImport 
                fileInputRef={fileInputRef} 
                handleFileImport={handleFileImport} 
              />
              
              <FolderWatch 
                watchConfig={watchConfig} 
                handleWatchConfigChange={handleWatchConfigChange}
                handleSelectFolder={handleSelectFolder}
              />
            </div>
            
            <ConnectionForm 
              status={status}
              accountInfo={accountInfo}
              handleChange={handleChange}
              handleConnect={handleConnect}
            />
          </div>
        )}

        {status === 'connected' && (
          <ConnectedStatus 
            accountInfo={accountInfo}
            watchConfig={watchConfig}
            handleDisconnect={handleDisconnect}
          />
        )}
      </div>
    </div>
  );
};
