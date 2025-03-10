
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    startWatchingFolder: (folderPath, filePattern) => 
      ipcRenderer.invoke('start-watching-folder', folderPath, filePattern),
    stopWatchingFolder: () => ipcRenderer.invoke('stop-watching-folder'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    onFileFound: (callback) => 
      ipcRenderer.on('file-found', (event, data) => callback(data)),
    onFileChanged: (callback) => 
      ipcRenderer.on('file-changed', (event, data) => callback(data)),
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
);
