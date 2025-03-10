
import React from 'react';
import { AccountInfo, WatchConfig } from './utils';

interface ConnectedStatusProps {
  accountInfo: AccountInfo;
  watchConfig: WatchConfig;
  handleDisconnect: () => void;
}

export const ConnectedStatus: React.FC<ConnectedStatusProps> = ({
  accountInfo,
  watchConfig,
  handleDisconnect,
}) => {
  return (
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
  );
};
