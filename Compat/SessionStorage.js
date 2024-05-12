import {is_browser} from "../Helper.js";

let SessionStorageRecord = {};

const SessionStorage = {
    getItem: (key) => {
        return SessionStorageRecord.hasOwnProperty(key) ? SessionStorageRecord[key] : null;
    },
    setItem: (key, value) => {
        SessionStorageRecord[key] = value;
    },
    removeItem: (key) => {
        if (SessionStorageRecord.hasOwnProperty(key)) {
            delete SessionStorageRecord[key];
        }
    },
    hasItem: (key) => {
        return SessionStorageRecord.hasOwnProperty(key);
    },
    clear: () => {
        SessionStorageRecord = {};
    },
    get length() {
        return Object.keys(SessionStorageRecord).length;
    }
};

export default (is_browser() && window && window.sessionStorage ? window.sessionStorage : SessionStorage);
