const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

// 启动后端服务
function startServer() {
  const isDev = !app.isPackaged;

  if (isDev) {
    // 开发环境：用 tsx 运行 TypeScript 后端
    serverProcess = spawn('npx', ['tsx', path.join(__dirname, '..', 'server', 'index.ts')], {
      stdio: 'inherit',
      shell: true,
    });
  } else {
    // 生产环境：用 node 运行编译后的后端
    // server/*.js 在 app 目录下，node_modules 在 resources 下
    const appPath = app.getAppPath();
    const serverPath = path.join(appPath, 'server', 'index.js');
    const nodeModulesPath = path.join(process.resourcesPath, 'node_modules');

    serverProcess = spawn('node', [serverPath], {
      stdio: 'inherit',
      cwd: appPath,
      env: {
        ...process.env,
        PORT: '3456',
        ELECTRON: 'true',
        NODE_PATH: nodeModulesPath,
      },
    });
  }

  serverProcess.on('error', (err) => {
    console.error('服务启动失败:', err);
  });
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Flux-SCM 供应商分析平台',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 加载页面
  const tryLoad = () => {
    const url = app.isPackaged ? 'http://localhost:3456' : 'http://localhost:5173';
    mainWindow.loadURL(url).catch(() => {
      setTimeout(tryLoad, 500);
    });
  };

  // 生产环境等待后端启动
  setTimeout(tryLoad, app.isPackaged ? 1500 : 300);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 窗口控制
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
