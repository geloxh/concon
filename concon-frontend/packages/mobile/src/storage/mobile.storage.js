import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorage is async but the shared tokenStorage interface is sync —
// so cache tokens in memory and hydrate on app boot
let cache = {};

export const mobileStorage = {
    getItem: (key) => cache[key] || null,
    setItem: (key, value) => {
        cache[key] = value;
        AsyncStorage.setItem(key, value);
    },
    removeItem: (key) => {
        delete cache[key];
        AsyncStorage.removeItem(key);
    },
};

export async function hydrateStorage() {
    const keys = ["accessToken", "refreshToken"];
    const values = await AsyncStorage.multiGet(keys);
    values.forEach(([key, value]) => {
        if (value) cache[key] = value;
    });
}