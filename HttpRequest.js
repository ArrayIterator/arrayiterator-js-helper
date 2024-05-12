// convert any object to url encode
// even nested
import {
    each, empty,
    encode_param,
    in_array,
    is_object,
    is_scalar,
    is_string,
    lower,
    lower_trim,
    sprintf,
    strval,
    trim,
    upper,
    upper_trim,
    base64_encode
} from "./Helper";
import {
    RequestMethodError,
    ArgumentError,
    HttpRequestError,
    RequestTimeoutError,
    UrlError
} from "./HttpError";
import XMLHttpRequest from "./Compat/XMLHttpRequest";

const normalizeHeaderKey = (key) => {
    key = key.replace(/_+/, '-');
    return lower(key).replace(/(^|-)([a-z])/g, (m, j, l) => j + upper(l));
}

const clone = (obj) => {
    const cloned = Array.isArray(obj) ? [] : {};
    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            cloned[i] = clone(obj[i]);
            continue;
        }
        cloned[i] = obj[i];
    }
    return cloned;
}

const acceptedType = [
    'auto',
    'json',
    'raw',
    'param',
    'multipart',
];

/**
 * @param {HttpRequest} request
 */
const assert = (request) => {
    if (request.xml) {
        throw new ArgumentError(
            'Can not doing change to option while processing request'
        );
    }
}

/**
 * Create http authorization string for header
 *
 * @param {string} type
 * @param {object} options
 * @returns {string|null}
 */
const createHttpAuthorizationHeader = (type, options = {}) => {
    if (!type || !is_string(type) || !is_object(options)) {
        return null;
    }
    let realType = type.trim();
    type = lower(type);
    if (type === 'basic') {
        let {username, password, token} = options;
        if (!is_string(username) || empty(username)) {
            if (is_string(token) && !empty(token)) {
                return sprintf('Basic %s', token);
            }
            return null;
        }
        password = is_string(password) ? password : '';
        return sprintf('Basic %s', base64_encode(sprintf('%s:%s', username, password)));
    }
    if (type === 'negotiate') {
        if (empty(options.token) || !is_string(options.token)) {
            return null;
        }
        return sprintf('Negotiate %s', options.token);
    }
    if (type === 'bearer') {
        if (empty(options.token) || !is_string(options.token)) {
            return null;
        }
        return sprintf('Bearer %s', options.token);
    }
    if (type === 'digest') {
        const digestParams = ['username', 'realm', 'nonce', 'uri', 'response', 'opaque', 'qop', 'nc', 'cnonce', 'algorithm'];
        const params = [];
        each(digestParams, (i, key) => {
            let value = options[key] || '';
            if (is_scalar(value)) {
                value = !is_string(value) ? strval(value) : value;
                // encode component for header authorization
                value = encodeURIComponent(value);
                params.push(sprintf('%s="%s"', key, value));
            }
        });
        if (empty(params)) {
            if (is_string(options.token) && !empty(options.token)) {
                return sprintf('Digest %s', options.token);
            }
            return null;
        }
        return sprintf('Digest %s', params.join(', '));
    }
    const credentials = options.credentials || null;
    if (is_string(credentials)) {
        if (type.toUpperCase() === 'AWS4-HMAC-SHA256') {
            realType = 'AWS4-HMAC-SHA256';
        }
        return sprintf('%s %s', realType, credentials);
    }
    return null;
};

class HttpRequest {
    #options = {
        url: null,
        method: 'GET',
        headers: {},
        timeout: 0,
        nocache: false,
        data: null,
        authorization: {},
        type: 'auto',
        onState: () => {},
        onProgress: () => {}
    };

    /**
     * XMLHttpRequest instance
     * @type {XMLHttpRequest}
     */
    #xml = null;

    /**
     * Response instance
     * @type {Response}
     */
    #response  = null;

    /**
     * HttpRequest constructor
     * @param {string} url
     * @param {object} options
     * @returns {HttpRequest}
     */
    constructor(url, options = {}) {
        if (new.target === undefined) {
            return new HttpRequest(url, options);
        }
        if (url) {
            this.setUrl(url);
        }
        if (is_object(options)) {
            each(options, (key, value) => this.setOption(key, value));
        }
        return this;
    }

    setUrl(url) {
        assert(this);

        const {protocol, origin} = location;
        if (url instanceof URL) {
            this.#options.url = url;
            return this;
        }
        if (typeof url !== 'string') {
            throw new UrlError(
                'Url must be string or object URL'
            );
        }

        if (url.startsWith('//')) {
            url = protocol + url;
        } else if (url.startsWith('/')) {
            url = origin + url;
        } else if (!/^[a-z]+:\/\//.test(url)) {
            url = origin + '/' + url;
        }
        this.#options.url = new URL(url);
        return this;
    }
    setMethod(method) {
        assert(this);

        method = is_string(method) ? upper_trim(method) : this.#options.method;
        if (!method) {
            throw new RequestMethodError(
                'Method is required'
            );
        }
        this.#options.method = method;
        return this;
    }

    setOption(name, value) {
        name = is_string(name) ? lower_trim(name) : null;
        switch (name) {
            case 'headers':
                return this.setHeaders(value);
            case 'url':
                return this.setUrl(value);
            case 'method':
                return this.setMethod(value);
            case 'timeout':
                return this.setTimeout(value);
            case 'type':
                return this.setType(value);
            case 'onstate':
                return this.setOnState(value);
            case 'onprogress':
                return this.setOnProgress(value);
            case 'data':
            case 'body':
                return this.setData(value);
            case 'form_data':
            case 'formdata':
                return this
                    .setType('multipart')
                    .setData(value);
            case 'raw':
                return this
                    .setType('raw')
                    .setData(value);
            case 'param':
                return this
                    .setType('param')
                    .setData(value);
            case 'json':
                return this.setType('json').setData(value);
            case 'cache':
                return this.setCache(value);
            case 'authorization':
                if (is_object(value)) {
                    const {type, options} = value;
                    return this.setAuthorization(type, options);
                }
                if (is_string(value)) {
                    const match = value.match(/^([a-z]+)\s+(.+)$/i);
                    if (match) {
                        const [_, type, options] = match;
                        return this.setAuthorization(type, options);
                    }
                }
                return this;
        }
        return this;
    }
    setCache(value) {
        assert(this);
        this.#options.nocache = !value;
        return this;
    }
    setHeaders(value) {
        if (!value || !is_object(value)) {
            return this;
        }
        this.#options.headers = {};
        each(value, (key, value) => this.setHeader(key, value));
        return this;
    }

    setHeader(key, value) {

        assert(this);
        if (!key || !is_string(key)) {
            return this;
        }
        key = key ? normalizeHeaderKey(key).toLowerCase() : null;
        if (!key) {
            return this;
        }
        // check authorization
        if (key === 'authorization') {
            if (is_object(value)) {
                return this.setAuthorization(value.type, value.options);
            }
            if (is_object(value) && value.type) {
                return this.setAuthorization(value.type, value.options);
            }
            if (!is_string(value)) {
                return this;
            }
            let [type, ...options] = value.split(' ');
            if (type.trim() === '') {
                return this;
            }
            options = options.join(' ').trim();
            this.#options.authorization = {
                type: type,
                options: {
                    token: options
                }
            }
            return this;
        }
        if (typeof value === 'number') {
            value = value.toString();
        }
        if (typeof value === 'string') {
            this.headers[key] = value;
        }
        return this;
    }

    removeHeader(key) {
        assert(this);
        if (!is_string(key) || !key) {
            return this;
        }
        key = normalizeHeaderKey(key).toLowerCase();
        delete this.#options.headers[key];
        return this;
    }

    setTimeout(timeout) {
        assert(this);
        timeout = typeof timeout === 'number' ? parseInt(timeout) : 0;
        this.#options.timeout = timeout;
        return this;
    }

    setType(type) {
        assert(this);
        type = typeof type === 'string' ? lower_trim(type) : 'auto';
        for (let accepted of acceptedType) {
            if (type.startsWith(accepted)) {
                this.#options.type = accepted;
                return this;
            }
        }
        this.#options.type = 'auto';
        return this;
    }

    setOnState(callback) {
        assert(this);
        if (typeof callback === 'function') {
            this.#options.onState = callback;
        }
        return this;
    }

    setOnProgress(callback) {
        assert(this);
        if (typeof callback === 'function') {
            this.#options.onProgress = callback;
        }
        return this;
    }

    /**
     * Set authorization header basic
     * @param {string} username
     * @param {string} password
     * @returns {HttpRequest}
     */
    setAuthorizationBasic(username, password) {
        assert(this);
        if (!is_string(username) || username === '') {
            this.#options.authorization = {};
            return this;
        }
        password = is_string(password) ? password : null;
        this.#options.authorization = {
            type: 'basic',
            options: {
                username: username || null,
                password: password || null
            }
        }
        return this;
    }

    /**
     * Set authorization header bearer
     * @param {string} token
     * @returns {HttpRequest}
     */
    setAuthorizationBearer(token) {
        assert(this);
        if (!is_string(token) || token === '') {
            this.#options.authorization = {};
            return this;
        }
        this.#options.authorization = {
            type: 'bearer',
            options: {
                token: token || null
            }
        }
        return this;
    }

    /**
     * Set authorization header digest
     * @param {object} options
     * @returns {HttpRequest}
     */
    setAuthorizationDigest(options = {}) {
        assert(this);
        options = !is_object(options) ? {} : options;
        if (empty(options) || !is_string(options.username)) {
            this.#options.authorization = {};
            return this;
        }
        this.#options.authorization = {
            type: 'digest',
            options
        }
        return this;
    }

    /**
     * Set authorization header
     * @param {string} type
     * @param {object|null} options if not an object will reset authorization
     * @returns {HttpRequest}
     */
    setAuthorization(type, options = null) {
        assert(this);
        type = is_string(type) && type ? lower_trim(type) : null;
        if (is_string(options) && !empty(options)) {
            options = {token: options};
        }
        if (!is_object(options) || !type) {
            this.#options.authorization = {};
            return this;
        }
        this.#options.authorization = {
            type,
            options
        }
        return this;
    }
    setData(data) {
        assert(this);
        this.#options.data = data;
        return this;
    }
    get xml() {
        return this.#xml;
    }
    set xml(value) {
        // do nothing
    }
    get url() {
        return this.#options['url'];
    }
    set url(url) {
        this.setUrl(url);
    }
    get headers() {
        return this.#options.headers;
    }
    set headers(value) {
        if (!value) {
            this.#options.headers = {};
            return;
        }
        this.setHeaders(value);
    }
    get timeout() {
        return this.#options.timeout;
    }

    set timeout(timeout) {
        this.setTimeout(timeout);
    }

    get method() {
        return this.#options.method;
    }

    set method(method) {
        this.setMethod(method);
    }
    get type() {
        return this.#options.type;
    }

    set type(type) {
        this.setType(type);
    }

    get onState() {
        return this.#options.onState;
    }
    set onState(callback) {
        this.setOnState(callback);
    }

    get onProgress() {
        return this.#options.onProgress;
    }
    set onProgress(callback) {
        this.setOnProgress(callback);
    }
    set authorization(value) {
        if (is_string(value)) {
            const match = value.match(/^([a-z]+)\s+(.+)$/i);
            if (match) {
                const [_, type, options] = match;
                return this.setAuthorization(type, options);
            }
        }
        if (is_object(value)) {
            const {type, options} = value;
            return this.setAuthorization(type, options);
        }
        return this;
    }
    get authorization() {
        return this.#options.authorization;
    }
    get data() {
        return this.#options.data;
    }
    get response() {
        return this.#response;
    }

    /**
     * Send request
     * @returns {Promise<{response: Response, xml: XMLHttpRequest, request: HttpRequest}>}
     */
    send() {
        if (this.response) {
            return Promise.resolve({response: this.response, xml: this.xml, request: this});
        }
        if (this.xml) {
            return Promise.reject(
                new HttpRequestError(
                    'Request already sent',
                    'E_ERROR',
                    this.xml
                )
            );
        }
        if (!this.url) {
            return Promise.reject(
                new UrlError(
                    'Url is required'
                )
            );
        }
        if (!this.method) {
            return Promise.reject(
                new RequestMethodError(
                    'Method is required'
                )
            );
        }
        let stopped = false;
        let type = this.type;
        const authorization = this.authorization;
        if (!empty(authorization)) {
            const {type, options} = authorization;
            const header = createHttpAuthorizationHeader(type, options);
            if (header) {
                this.setHeader('Authorization', header);
            }
        }
        this.#xml = new XMLHttpRequest();
        this.#xml.timeout = this.timeout;
        const parseHeadersResponse = (header) => {
            if (!header) {
                return {};
            }
            const headers = {};
            header.split('\n').forEach((line) => {
                const [key, value] = line.split(':');
                if (key && value) {
                    headers[normalizeHeaderKey(key)] = value.trim();
                }
            });
            return headers;
        }
        return new Promise((resolve, reject) => {
            this.#xml.onprogress = (event) => this.onProgress(event);
            this.#xml.onerror = (event) => (stopped = true) && reject(new HttpRequestError(event.message, 'E_ERROR', this.#xml, event));
            this.#xml.ontimeout = (event) => (stopped = true) && reject(new RequestTimeoutError('Request Timeout', 'E_TIMEOUT', this.#xml, event));
            this.#xml.onreadystatechange = (event) => {
                if (stopped) {
                    return;
                }
                const {readyState, status} = this.xml;
                const stateCallback = this.onState;
                stateCallback(readyState, this.xml);
                if (readyState !== 4) {
                    return;
                }
                if (status === 0) {
                    reject(new RequestTimeoutError(
                        'Request Timeout',
                        'E_TIMEOUT',
                         this.xml,
                        event || new Event('timeout')
                    ));
                    return;
                }
                stopped = true;
                const response = Object.freeze(
                    this.xml.response instanceof Blob
                    ? this.xml.response
                    : new Blob([this.xml.response], {type: this.xml.getResponseHeader('Content-Type') || 'text/plain'})
                );
                this.#response = new Response(
                    response,
                    {
                        headers: parseHeadersResponse(this.xml.getAllResponseHeaders()),
                        status,
                        statusText: this.xml.statusText,
                    }
                )
                resolve({response: this.response, xml: this.xml, request: this});
            };
            this.#xml.open(this.method, this.url, true);
            let data = null;
            const headers = clone(this.headers);
            if (in_array(this.method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                let contentType = headers['Content-Type'] || null;
                let hasContentType = false;
                if (contentType !== null) {
                    contentType = lower(contentType);
                    hasContentType = true;
                    if (contentType === 'application/json') {
                        if (this.data instanceof FormData) {
                            const forms = {};
                            each(this.data.entries(), (k, v) => forms[k[0]] = v[1]);
                            data = JSON.stringify(forms);
                        } else if (is_object(this.data)) {
                            data = JSON.stringify(this.data);
                        }
                    } else if (contentType === 'application/x-www-form-urlencoded') {
                        data = encode_param(this.data);
                    } else {
                        data = this.data;
                    }
                } else {
                    data = this.data;
                }
                if (!hasContentType && type === 'auto') {
                    if (is_string(data) && /^([\[{])/.test(trim(data))) {
                        try {
                            JSON.parse(data);
                            type = 'json';
                        } catch (e) {
                            type = 'raw';
                        }
                    } else if (data instanceof FormData) {
                        type = 'multipart';
                    } else if (is_object(data)) {
                        // check if contains file upload
                        const checkIfContainFile = (e) => {
                            if (e instanceof File) {
                                return true;
                            }
                            if (is_object(e)) {
                                for (let i in e) {
                                    if (checkIfContainFile(e[i])) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }
                        if (checkIfContainFile(data)) {
                            type = 'multipart';
                        } else {
                            type = 'param';
                            data = encode_param(data);
                        }
                    } else if (is_string(data)) {
                        type = 'raw';
                        // check if contain encoded params
                        if (/^[\w\-_]+=[\w\-_]+(&[\w\-_]+=[\w\-_]+)*$/.test(trim(data))) {
                            type = 'param';
                        }
                    } else {
                        type = 'raw';
                        data = strval(data);
                    }
                }
                switch (type) {
                    case 'json':
                        headers['Content-Type'] = 'application/json';
                        break;
                    case 'param':
                        headers['Content-Type'] = 'application/x-www-form-urlencoded';
                        break;
                    case 'multipart':
                        headers['Content-Type'] = 'multipart/form-data';
                        break;
                    case 'raw':
                        headers['Content-Type'] = 'text/plain';
                }
            }
            this.#xml.send(data);
        });
    }
}

export default HttpRequest;
export const Request = (url, method = 'GET', options = {}) => new HttpRequest(url, {method, ...options});
