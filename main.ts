import { app, BrowserWindow, ipcMain, screen, webFrame } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as logger from 'electron-log';
import { SnapDB } from 'snap-db';
import * as youtubedl from 'youtube-dl';

logger.catchErrors();

let win: BrowserWindow;
let serve: boolean;

const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

const appPath = app.getAppPath();

const db = new SnapDB({
  dir: `${appPath}/f1tv.db`,
  key: 'string'
});

export interface ConfigKV {
  key: string;
  value: string;
}

ipcMain.on('get-cfg', async (event, arg: string) => {
  try {
    event.returnValue = await db.get(`cfg_${arg}`);
  } catch (e) {
    event.returnValue = null;
  }
});

ipcMain.on('set-cfg', async (event, arg: ConfigKV) => {
  try {
    await db.put(`cfg_${arg.key}`, arg.key);

    event.returnValue = true;
  } catch (e) {
    event.returnValue = false;
  }
});

export interface StreamDownloadRequest {
  streamUrl: string;
}

ipcMain.on('download', (async (event, request: StreamDownloadRequest) => {
  const destPath = await db.get('cfg_dl_path');

  const video = youtubedl(request.streamUrl, [], {
    cwd: destPath,
  });

  video.on('info', (info) => {
    ipcMain.emit('download_progress', info);
  });
}));

function createWindow() {
  const cursorScreenPoint = screen.getCursorScreenPoint();
  const size = screen.getDisplayNearestPoint(cursorScreenPoint).workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    title: 'F1TV',
    titleBarStyle: 'hiddenInset',
    darkTheme: true,
    fullscreenWindowTitle: true,
    vibrancy: 'ultra-dark',
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    minWidth: 500,
    minHeight: 500,
    maximizable: false,
    alwaysOnTop: true,
    webPreferences: {
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true,
    }));

    webFrame.clearCache();
  }

  if (serve) {
    // win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  app.on('before-quit', () => {

  });

} catch (e) {
  logger.error(e);
}
