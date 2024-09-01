import { app, shell, BrowserWindow, ipcMain ,dialog} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const { SerialPort } = require('serialport');
const { spawn } = require('child_process');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setTitle('ESP32-LITTLEFS-FLASH');
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('open-folder-dialog', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      if (!result.canceled) {
        return result.filePaths[0];
      }
      return null;
    });
    console.log(SerialPort.list());
  ipcMain.handle('request-serial-ports', (event) => {
      return SerialPort.list();
    });

  ipcMain.on('run-command', (event, command) => {
    console.log('ipcMain Run Command');
    let esptoolPath, mklittlefsPath;
    if (process.platform === 'win32') {
      esptoolPath = join(__dirname, "../../resources/win32/esptool.exe").replace("app.asar", "app.asar.unpacked");
      mklittlefsPath = join(__dirname, "../../resources/win32/mklittlefs.exe").replace("app.asar", "app.asar.unpacked");
    } else if (process.platform === 'darwin') {
      esptoolPath = join(__dirname, "../../resources/darwin/esptool").replace("app.asar", "app.asar.unpacked");
      mklittlefsPath = join(__dirname, "../../resources/darwin/mklittlefs").replace("app.asar", "app.asar.unpacked");
    } else if (process.platform === 'linux') {
      esptoolPath = join(__dirname, "../../resources/linux/esptool").replace("app.asar", "app.asar.unpacked");
      mklittlefsPath = join(__dirname, "../../resources/linux/mklittlefs").replace("app.asar", "app.asar.unpacked");
    } else {
      console.log('Unknown platform:', platform);
      event.sender.send('command-output', 'Unknown platform:' + platform)
      return;
    }
    process.stdout.write(esptoolPath + "\n");
    process.stdout.write(mklittlefsPath + "\n");

    event.sender.send('command-output', 'Start packaging files for the LittleFS partition.\n')
    const littlefsexe = spawn(mklittlefsPath, command.mklittlefs, { shell: true });//mklittlefsPath + command.mklittlefs);

    littlefsexe.stdout.on('data', (data) => {
      event.sender.send('command-output', `${data}`);
    });

    littlefsexe.stderr.on('data', (data) => {
      event.sender.send('command-output', `${data}`);
    });

    littlefsexe.on('error', (error) => {
      event.sender.send('command-output', `Error: ${error.message}\nError Code:${error.code}\nSignal Received: ${error.signal}`);
    });

    littlefsexe.on('close', (code) => {
      if (code !== 0) {
        event.sender.send('command-output', `Process exited with code ${code}`);
      }
      else
      {
        event.sender.send('command-output', 'Packing completed.\n\nStarting the flashing process for the image file.')
        const esptoolexe = spawn(esptoolPath, command.esptool, { shell: true });

        esptoolexe.stdout.on('data', (data) => {
          event.sender.send('command-output', `${data}`);
        });

        esptoolexe.stderr.on('data', (data) => {
          event.sender.send('command-output', `${data}`);
        });

        esptoolexe.on('error', (error) => {
          event.sender.send('command-output', `Error: ${error.message}\nError Code:${error.code}\nSignal Received: ${error.signal}`);
        });

        esptoolexe.on('close', (code) => {
          if (code !== 0) {
            event.sender.send('command-output', `Process exited with code ${code}`);
          }
        });
      }
    });
  });


  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
