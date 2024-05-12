
const errorCodes = (objThis) => {
    if (typeof objThis.name !== 'string' || objThis.name === '') {
        return 'E_ERROR';
    }
    switch (objThis.name) {
        case 'UrlError':
            return 'E_URL';
        case 'RequestTimeoutError':
            return 'E_TIMEOUT';
        case 'RequestMethodError':
            return 'E_METHOD';
        case 'ArgumentError':
            return 'E_ARGUMENT';
        case 'HttpResponseError':
            return 'E_RESPONSE';
        default:
            return 'E_ERROR';
    }
}
export class HttpError extends Error {
    /**
     * @param {string} message
     * @param {?string} code
     * @param {XMLHttpRequest} xml
     * @param {Event} event
     * @returns {Readonly<HttpError>}
     */
    constructor(message, code = null , xml = null, event = null) {
        super(message);
        this.code = code || errorCodes(this);
        this.xml = xml;
        if (Object.prototype.toString.call(event) === '[Object object]' && typeof event.message === 'string') {
            event = new ErrorEvent('Error', event);
        }
        this.event = event || new ErrorEvent(
            'Error',
            {
                message
            }
        );
        return Object.freeze(this);
    }
}

export class HttpRequestError extends HttpError {}
export class HttpResponseError extends HttpError {}
export class UrlError extends HttpRequestError {}
export class RequestTimeoutError extends HttpRequestError {}
export class RequestMethodError extends HttpRequestError {}
export class ArgumentError extends HttpRequestError {}

export default HttpError;
