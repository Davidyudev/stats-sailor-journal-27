
declare interface Window {
  electronAPI?: {
    selectFolder: () => Promise<{ canceled: boolean; filePath?: string }>;
    startWatchingFolder: (folderPath: string, filePattern: string) => Promise<{ success: boolean; error?: string }>;
    stopWatchingFolder: () => Promise<{ success: boolean; message?: string }>;
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    onFileFound: (callback: (data: { path: string }) => void) => void;
    onFileChanged: (callback: (data: { path: string }) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
}
