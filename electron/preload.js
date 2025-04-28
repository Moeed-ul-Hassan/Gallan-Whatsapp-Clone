// Preload script to expose Electron APIs to the renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Expose specific APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Example: Send a message to the main process
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // Example: Receive a message from the main process
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  // Example: Get app version
  getAppVersion: () => process.env.npm_package_version,
});