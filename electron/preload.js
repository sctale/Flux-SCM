const { contextBridge, ipcRenderer } = require('electron');

// 安全沙箱：暴露窗口控制API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Flux-SCM 已启动');
});
