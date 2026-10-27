const { ipcMain } = require("electron");
const Store = require("electron-store");
const store = new Store({ encryptionKey: "your-encryption-key" }); // encrypts tokens at rest

ipcMain.handle("store-get", (e, key) => store.get(key));
ipcMain.handle("store-set", (e, key, value) => store.set(key, value));
ipcMain.handle("store-delete", (e, key) => store.delete(key));