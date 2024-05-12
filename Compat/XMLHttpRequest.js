import {base64_encode, is_browser} from "../Helper";

class XMLHttpRequest {
    #props = {
        method: '',
        url: '',
        async: true,
        user: null,
        password: null,
        headers: {},
        readyState: 0,
        responseText: '',
        response: null,
        status: 0,
        statusText: '',
        onreadystatechange: null,
        onerror: null,
        onload: null,
        onabort: null,
        ontimeout: null,
        onprogress: null,
        upload: null,
        withCredentials: false,
        responseType: '',
        responseURL: '',
        responseXML: null,
        timeout: 0,
        uploadComplete: false,
        uploadCompleteCount: 0,
        xhr: null,
        responseHeaders: {},
    };
    static UNSENT = 0;
    static OPENED = 1;
    static HEADERS_RECEIVED = 2;
    static LOADING = 3;
    static DONE = 4;

    #controller = null;
    #fetch = null;

    constructor() {
    }

    set responseType(value) {
        this.#props.responseType = value;
    }

    get responseType() {
        return this.#props.responseType;
    }

    set withCredentials(value) {
        this.#props.withCredentials = value;
    }

    get withCredentials() {
        return this.#props.withCredentials;
    }

    set timeout(value) {
        this.#props.timeout = value;
    }

    get timeout() {
        return this.#props.timeout;
    }

    set upload(value) {
        this.#props.upload = value;
    }

    get upload() {
        return this.#props.upload;
    }

    set onprogress(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.onprogress = value;
    }

    get onprogress() {
        return this.#props.onprogress;
    }

    set ontimeout(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.ontimeout = value;
    }

    get ontimeout() {
        return this.#props.ontimeout;
    }

    set onabort(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.onabort = value;
    }

    get onabort() {
        return this.#props.onabort;
    }

    set onload(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.onload = value;
    }

    get onload() {
        return this.#props.onload;
    }

    set onerror(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.onerror = value;
    }

    get onerror() {
        return this.#props.onerror;
    }

    set onreadystatechange(value) {
        if (typeof value !== 'function') {
            throw new TypeError('The provided value is not a function');
        }
        this.#props.onreadystatechange = value;
    }

    get onreadystatechange() {
        return this.#props.onreadystatechange;
    }

    set statusText(value) {
    }

    get statusText() {
        return this.#props.statusText;
    }

    set status(value) {
    }

    get status() {
        return this.#props.status;
    }

    set response(value) {
    }

    get response() {
        return this.#props.response;
    }

    set responseText(value) {
    }

    get responseText() {
        return this.#props.responseText;
    }

    set responseXML(value) {
    }

    get responseXML() {
        return this.#props.responseXML;
    }

    set responseURL(value) {
    }

    get responseURL() {
        return this.#props.responseURL;
    }

    set readyState(value) {
    }

    get readyState() {
        return this.#props.readyState;
    }

    get xhr() {
        return this.#props.xhr;
    }

    get method() {
        return this.#props.method;
    }

    get url() {
        return this.#props.url;
    }

    get async() {
        return this.#props.async;
    }

    get user() {
        return this.#props.user;
    }

    get password() {
        return this.#props.password;
    }

    open(method, url, async = true, user = null, password = null) {
        if (this.xhr) {
            throw new Error('The connection is already open');
        }
        if (typeof method !== 'string') {
            throw new TypeError('The provided value is not a string');
        }
        if (typeof url !== 'string' && !(url instanceof URL)) {
            throw new TypeError('The provided value is not a string');
        }
        async = !!async;
        user = user === null ? null : String(user);
        password = password === null ? null : String(password);
        this.#props.method = method;
        this.#props.url = url;
        this.#props.async = async;
        this.#props.user = user;
        this.#props.password = password;
        this.#props.readyState = 1;
        this.#props.xhr = this;
    }

    setRequestHeader(header, value) {
        if (this.#props.readyState !== 1) {
            throw new Error('The connection is not open');
        }
        if (!this.#props.xhr) {
            throw new Error('The connection is not open');
        }
        if (typeof header !== 'string') {
            throw new TypeError('The provided value is not a string');
        }
        if (typeof value !== 'string') {
            throw new TypeError('The provided value is not a string');
        }
        this.#props.headers[header] = value;
    }

    getResponseHeader(header) {
        if (!this.#props.xhr) {
            throw new Error('The connection is not open');
        }
        if (typeof header !== 'string') {
            throw new TypeError('The provided value is not a string');
        }
        const keyLower = header.toLowerCase().trim();
        for (const key in this.#props.responseHeaders) {
            if (key.toLowerCase() === keyLower) {
                return this.#props.responseHeaders[key];
            }
        }
        return null;
    }

    getAllResponseHeaders() {
        if (!this.#props.xhr) {
            throw new Error('The connection is not open');
        }
        let headers = '';
        for (const key in this.#props.responseHeaders) {
            headers += key + ': ' + this.#props.responseHeaders[key] + '\r\n';
        }
        return headers;
    }

    abort() {
        if (this.#props.xhr) {
            this.#props.xhr = null;
            if (this.#controller) {
                this.#controller.abort();
                this.#controller = null;
            }
            this.onabort && this.onabort(new Event('abort'), this);
        }
    }

    send(data) {
        if (!this.#props.xhr) {
            throw new Error('The connection is not open');
        }
        if (this.#controller) {
            throw new Error('The connection is already open');
        }
        if (data && typeof data !== 'string' && !(data instanceof FormData)) {
            throw new TypeError('The provided value is not a string or FormData');
        }
        const url = this.#props.url;
        const method = this.#props.method;
        // const async = this.#props.async;
        const user = this.#props.user;
        const password = this.#props.password;
        const headers = this.#props.headers;
        const responseType = this.#props.responseType;
        const withCredentials = this.#props.withCredentials;
        const timeout = this.#props.timeout;
        const controller = new AbortController();
        this.#controller = controller;
        const signal = controller.signal;
        if (user) {
            headers['Authorization'] = 'Basic ' + base64_encode(user + (password ? ':' + password : ''));
        }
        this.#fetch = fetch(url, {
            method,
            headers,
            body: data,
            signal,
            mode: 'cors',
            cache: 'default',
            credentials: withCredentials ? 'include' : 'same-origin',
            redirect: 'follow',
            referrer: 'client',
            keepalive: true,
        });
        let timeoutFn = setTimeout(() => {
            timeoutFn = null;
            controller.abort();
        }, timeout);
        this.#fetch.then(async (response) => {
            if (signal.aborted) {
                return;
            }
            this.#props.responseHeaders = response.headers;
            this.#props.readyState = 2;
            this.#props.status = response.status;
            this.#props.statusText = response.statusText;
            if (this.onreadystatechange) {
                this.onreadystatechange(new Event('readystatechange'), this);
            }
            const contentType = response.headers.get('content-type');
            this.#props.responseText = await response.text();
            let res;
            if (contentType && contentType.includes('application/json') || responseType === 'json') {
                this.#props.responseJSON = await response.json();
                res = this.#props.responseJSON;
            } else {
                res = this.#props.responseText;
            }
            this.#props.readyState = 3;
            if (this.onreadystatechange) {
                this.onreadystatechange(new Event('readystatechange'), this);
            }
            return res;
        }).then((data) => {
            if (timeoutFn) {
                clearTimeout(timeoutFn);
                timeoutFn = null;
            }
            if (signal.aborted) {
                return;
            }
            this.#props.response = data;
            this.#props.readyState = 4;
            this.onload && this.onload(new Event('load'), this);
        }).catch((error) => {
            if (timeoutFn) {
                clearTimeout(timeoutFn);
                timeoutFn = null;
            }
            if (signal.aborted) {
                return;
            }
            this.#props.readyState = 4;
            this.onerror && this.onerror(error);
        }).finally(() => {
            if (timeoutFn) {
                clearTimeout(timeoutFn);
                timeoutFn = null;
            }
            this.#controller = null;
            this.#fetch = null;
            if (signal.aborted) {
                this.abort();
            }
        });
    }
}

const declaration = [
    'UNSENT',
    'OPENED',
    'HEADERS_RECEIVED',
    'LOADING',
    'DONE',
];
declaration.forEach((key, index) => {
    Object.defineProperty(XMLHttpRequest, key, {
        value: index,
        writable: false,
        enumerable: true,
        configurable: false,
    });
});
export default (is_browser() && window && window.XMLHttpRequest ? window.XMLHttpRequest : XMLHttpRequest);
