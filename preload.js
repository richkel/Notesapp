const { contextBridge, ipcRenderer } = require('electron');

    contextBridge.exposeInMainWorld('electron', {
      platform: process.platform,
      // Add any other electron features you want to expose to renderer
    });
