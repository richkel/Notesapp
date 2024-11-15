const { app, BrowserWindow, protocol } = require('electron');
    const path = require('path');
    const { setupAudioHandlers } = require('./audioHandler');

    function createWindow() {
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
      });

      protocol.registerFileProtocol('local', (request, callback) => {
        const filePath = request.url.replace('local://', '');
        callback({ path: path.normalize(`${__dirname}/${filePath}`) });
      });

      if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
      } else {
        win.loadFile('dist/index.html');
      }
    }

    app.whenReady().then(() => {
      createWindow();
      setupAudioHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
