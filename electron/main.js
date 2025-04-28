const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const serverModule = require('../dist-electron/server/index.electron.js');

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

// Development vs production environment
const isDev = process.env.NODE_ENV === 'development';
const port = 5000; // The port Express is running on

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false, // Don't show window until ready
    backgroundColor: '#111b21', // WhatsApp dark theme color
  });

  // Load the app
  const startUrl = isDev
    ? `http://localhost:${port}` // Development: use vite dev server
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'), // Production: use built files
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // Show window once it's ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create the window when Electron is ready and start the server
app.whenReady().then(async () => {
  try {
    // Start the Express server
    console.log('Starting Express server...');
    await serverModule.default.startServer(port);
    console.log('Express server started successfully');
    
    // Create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to start server:', error);
    app.quit();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Re-create the window in the app when the dock icon is clicked (macOS)
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});