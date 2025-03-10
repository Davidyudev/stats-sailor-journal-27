
import React from 'react';
import { FolderOpen } from 'lucide-react';
import { WatchConfig } from './utils';

interface FolderWatchProps {
  watchConfig: WatchConfig;
  handleWatchConfigChange: (name: string, value: any) => void;
  handleSelectFolder: () => void;
}

export const FolderWatch: React.FC<FolderWatchProps> = ({
  watchConfig,
  handleWatchConfigChange,
  handleSelectFolder,
}) => {
  return (
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
  );
};
