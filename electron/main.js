
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const chokidar = require('chokidar');

// Global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;
let fileWatcher = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, 'preload.js') // use a preload script
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open the DevTools automatically if developing
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.

// Listen for events from the renderer process
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { 
    canceled: false, 
    filePath: result.filePaths[0]
  };
});

// File watcher setup
ipcMain.handle('start-watching-folder', async (event, folderPath, filePattern) => {
  if (fileWatcher) {
    fileWatcher.close();
  }
  
  try {
    const pattern = path.join(folderPath, filePattern || '*.csv');
    console.log(`Starting to watch: ${pattern}`);
    
    fileWatcher = chokidar.watch(pattern, {
      persistent: true,
      ignoreInitial: false, // Process existing files
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });
    
    fileWatcher
      .on('add', path => {
        console.log(`File ${path} has been added`);
        mainWindow.webContents.send('file-found', { path });
      })
      .on('change', path => {
        console.log(`File ${path} has been changed`);
        mainWindow.webContents.send('file-changed', { path });
      });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up file watcher:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('stop-watching-folder', async () => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
    return { success: true };
  }
  return { success: false, message: 'No active watcher' };
});

// Read file contents
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { 
      success: true, 
      content
    };
  } catch (error) {
    console.error('Error reading file:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});
