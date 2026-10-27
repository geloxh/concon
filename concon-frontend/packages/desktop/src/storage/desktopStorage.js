// renderer side — talks to main process via IPC rather than touching fs directly
export const desktopStorage = {
  getItem: (key) => window.electronAPI.storeGet(key),
  setItem: (key, value) => window.electronAPI.storeSet(key, value),
  removeItem: (key) => window.electronAPI.storeDelete(key),
};