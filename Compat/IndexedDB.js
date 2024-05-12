import {is_browser} from "../Helper.js";

let Indexes = {};

class IndexedDBCompat {
    static open(name, version) {
        return new IDBOpenDBRequestCompat(name, version);
    }

    static deleteDatabase(name) {
        if (typeof name !== 'string') {
            return;
        }
        if (Indexes.hasOwnProperty(name)) {
            delete Indexes[name];
        }
    }

    static get(name) {
        if (typeof name !== 'string') {
            return;
        }
        if (Indexes.hasOwnProperty(name)) {
            return Indexes[name];
        }
        return null;
    }

    static set(name, value) {
        if (typeof name !== 'string') {
            return;
        }
        if (!(value instanceof IDBDatabaseCompat)) {
            return;
        }
        Indexes[name] = value;
    }

    static clear() {
        Indexes = {};
    }

    static getAll() {
        return Indexes;
    }

    static getAllKeys() {
        return Object.keys(Indexes);
    }

    static count() {
        return Object.keys(Indexes).length;
    }
}

class IDBOpenDBRequestCompat {
    callback = {
        onsuccess: null,
        onerror: null,
    }

    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.result = new IDBDatabaseCompat(name, version);
    }

    set onsuccess(callback) {
        if (typeof callback === 'function') {
            this.callback.onsuccess = (...args) => {
                callback(...args);
            }
        }
    }

    set onerror(callback) {
        if (typeof callback === 'function') {
            this.callback.onerror = (...args) => {
                callback(...args);
            }
        }
    }

    get onsuccess() {
        return this.callback.onsuccess;
    }

    get onerror() {
        return this.callback.onerror;
    }

    transaction(stores, mode) {
        return new IDBTransactionCompat(this.result);
    }

    deleteDatabase() {
        return IndexedDBCompat.deleteDatabase(this.name);
    }
}

class IDBDatabaseCompat {
    callback = {
        onabort: null,
        onclose: null,
    }

    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.stores = {};
    }

    set onabort(callback) {
        if (typeof callback === 'function') {
            this.callback.onabort = (...args) => {
                callback(...args);
            }
        }
    }

    set onclose(callback) {
        if (typeof callback === 'function') {
            this.callback.onclose = (...args) => {
                callback(...args);
            }
        }
    }

    get onabort() {
        return this.callback.onabort;
    }

    get onclose() {
        return this.callback.onclose;
    }

    createObjectStore(name, options) {
        return new IDBObjectStoreCompat(this.stores[name]);
    }

    deleteObjectStore(name) {
        if (this.stores.hasOwnProperty(name)) {
            delete this.stores[name];
        }
    }
}

class IDBTransactionCompat {
    callback = {
        oncomplete: null,
        onerror: null,
        onabort: null,
    }

    constructor(db) {
        this.db = db;
    }

    set oncomplete(callback) {
        if (typeof callback === 'function') {
            this.callback.oncomplete = callback;
        }
    }

    set onerror(callback) {
        if (typeof callback === 'function') {
            this.callback.onerror = (...args) => {
                callback(...args);
            }
        }
    }

    set onabort(callback) {
        if (typeof callback === 'function') {
            this.callback.onabort = (...args) => {
                callback(...args);
            }
        }
    }

    get oncomplete() {
        return this.callback.oncomplete;
    }

    get onerror() {
        return this.callback.onerror;
    }

    get onabort() {
        return this.callback.onabort;
    }

    objectStore(name) {
        if (!this.db.stores.hasOwnProperty(name)) {
            this.db.stores[name] = {
                name: name,
                indexes: {},
                data: {},
            };
        }
        return new IDBObjectStoreCompat(this.db.stores[name]);
    }
}

class IDBObjectStoreCompat {
    callback = {
        oncomplete: null,
        onerror: null,
        onabort: null,
    }

    constructor(store) {
        this.store = store;
    }

    set oncomplete(callback) {
        if (typeof callback === 'function') {
            this.callback.oncomplete = callback;
        }
    }

    set onerror(callback) {
        if (typeof callback === 'function') {
            this.callback.onerror = (...args) => {
                callback(...args);
            }
        }
    }

    set onabort(callback) {
        if (typeof callback === 'function') {
            this.callback.onabort = (...args) => {
                callback(...args);
            }
        }
    }

    get oncomplete() {
        return this.callback.oncomplete;
    }

    get onerror() {
        return this.callback.onerror;
    }

    get onabort() {
        return this.callback.onabort;
    }

    createIndex(name, keyPath, options) {
        if (!this.store.indexes.hasOwnProperty(name)) {
            this.store.indexes[name] = {
                name: name,
                keyPath: keyPath,
                options: options,
                data: {},
            };
        }
        return new IDBIndexCompat(this.store.indexes[name]);
    }

    add(value) {
        const key = this.store.data.length;
        this.store.data[key] = value;
        return key;
    }

    get(key) {
        return this.store.data[key];
    }

    getAll() {
        return this.store.data;
    }

    getAllKeys() {
        return Object.keys(this.store.data);
    }

    put(value) {
        const key = this.store.data.length;
        this.store.data[key] = value;
        return key;
    }

    delete(key) {
        if (this.store.data.hasOwnProperty(key)) {
            delete this.store.data[key];
        }
    }

    clear() {
        this.store.data = {};
    }

    count() {
        return Object.keys(this.store.data).length;
    }
}

class IDBIndexCompat {
    callback = {
        oncomplete: null,
        onerror: null,
        onabort: null,
    }

    constructor(index) {
        this.index = index;
    }

    set oncomplete(callback) {
        if (typeof callback === 'function') {
            this.callback.oncomplete = callback;
        }
    }

    set onerror(callback) {
        if (typeof callback === 'function') {
            this.callback.onerror = (...args) => {
                callback(...args);
            }
        }
    }

    set onabort(callback) {
        if (typeof callback === 'function') {
            this.callback.onabort = (...args) => {
                callback(...args);
            }
        }
    }

    get oncomplete() {
        return this.callback.oncomplete;
    }

    get onerror() {
        return this.callback.onerror;
    }

    get onabort() {
        return this.callback.onabort;
    }

    get(key) {
        return this.index.data[key];
    }

    getAll() {
        return this.index.data;
    }

    getAllKeys() {
        return Object.keys(this.index.data);
    }

    put(value) {
        const key = this.index.data.length;
        this.index.data[key] = value;
        return key;
    }

    delete(key) {
        if (this.index.data.hasOwnProperty(key)) {
            delete this.index.data[key];
        }
    }

    clear() {
        this.index.data = {};
    }

    count() {
        return Object.keys(this.index.data).length;
    }
}

export default (is_browser() && window && window.indexedDB ? window.indexedDB : IndexedDBCompat);
