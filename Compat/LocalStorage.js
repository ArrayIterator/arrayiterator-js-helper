import {is_browser} from "../Helper.js";

let LocalStorageRecord = {};

const LocalStorage = {
    getItem: (key) => {
        return LocalStorageRecord.hasOwnProperty(key) ? LocalStorageRecord[key] : null;
    },
    setItem: (key, value) => {
        LocalStorageRecord[key] = value;
    },
    removeItem: (key) => {
        if (LocalStorageRecord.hasOwnProperty(key)) {
            delete LocalStorageRecord[key];
        }
    },
    hasItem: (key) => {
        return LocalStorageRecord.hasOwnProperty(key);
    },
    clear: () => {
        LocalStorageRecord = {};
    },
    get length() {
        return Object.keys(LocalStorageRecord).length;
    }
};

export default (is_browser() && window && window.localStorage ? window.localStorage : LocalStorage);
