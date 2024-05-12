import localStorage from './Compat/LocalStorage.js';
import sessionStorage from './Compat/SessionStorage.js';
import indexedDB from "./Compat/IndexedDB.js";
import XMLHttpRequest from "./Compat/XMLHttpRequest.js";
import {is_browser} from "./Helper.js";
const hasWindow = is_browser();

const cookies = {};
const setCookie = (singleCookieValue) => {
    const current = new Date().getTime();
    for (let key in cookies) {
        if (cookies[key].expires !== 0 && cookies[key].expires < current) {
            delete cookies[key];
        }
    }
    const match = singleCookieValue.match(/^\s*([^=]+)\s*=\s*(.+)?$/);
    const key = match[1];
    let split = (match[2] || '').split(';');
    const data = {
        path: '/',
        value: split.shift(),
        expires: 0,
        secure: false,
        domain: '',
        sameSite: '',
        httpOnly: false,
    };
    split.forEach((part) => {
        let [k, v] = part.split('=');
        k = k.trim().toLowerCase();
        if (k === 'expires') {
            data.expires = v;
        } else if (k === 'path') {
            data.path = v;
        } else if (k === 'domain') {
            data.domain = v;
        } else if (k === 'secure') {
            data.secure = true;
        } else if (k === 'samesite') {
            data.sameSite = v;
        } else if (k === 'httponly') {
            data.httpOnly = true;
        }
    });
    if (data.expires !== 0) {
        data.expires = new Date(data.expires).getTime();
        if (current > data.expires) {
            delete cookies[key];
            return;
        }
    }
    cookies[key] = data;
}
const Window = hasWindow ? window : {
    document: {
        createElement: () => null,
        addEventListener: () => null,
        removeEventListener: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        get cookie() {
            return Object.keys(cookies).map((key) => {
                return `${key}=${cookies[key].value}`;
            });
        },
        set cookie(value) {
            setCookie(value);
        }
    },
    localStorage,
    sessionStorage,
    indexedDB,
    location: {
        href: '',
        origin: '',
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        host: '',
    },
    navigator: {
        userAgent: '',
        language: '',
        platform: '',
        vendor: '',
    },
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0,
    XMLHttpRequest,
    addEventListener: () => null,
    removeEventListener: () => null,
    requestAnimationFrame: () => null,
    cancelAnimationFrame: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
};
Object.defineProperty(Window, '$isBrowserWindow', {
    value: hasWindow,
    writable: false,
    enumerable: false,
    configurable: false,
});

export default Window;
