// Each platform injects its own storage implementation at app startup
let storageImpl = null;

export function setStorageImpl(impl) {
  storageImpl = impl; // { getItem, setItem, removeItem }
}

export function getAccessToken() {
  return storageImpl.getItem("accessToken");
}

export function getRefreshToken() {
  return storageImpl.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  storageImpl.setItem("accessToken", accessToken);
  if (refreshToken) storageImpl.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  storageImpl.removeItem("accessToken");
  storageImpl.removeItem("refreshToken");
}