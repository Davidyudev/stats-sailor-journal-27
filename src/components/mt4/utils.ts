
/**
 * Utilities for the MT4 connector
 */

/**
 * Check if running in Electron environment
 */
export const isElectron = (): boolean => {
  return window.electronAPI !== undefined;
};

/**
 * Types for MT4 connector
 */
export type ConnectorStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface AccountInfo {
  server: string;
  account: string;
  password: string;
}

export interface WatchConfig {
  enabled: boolean;
  interval: number; // minutes
  lastCheck: Date | null;
  folderPath: string;
  filePattern: string;
}
