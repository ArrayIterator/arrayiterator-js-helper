/*!
 * Helper function to working like usefully php function declarations
 */

/**
 * Create regexp for trim
 * @param {string} e
 * @param {string} position
 * @returns {RegExp}
 */
const createTrimRegexP = (e, position = 'both') => {
    const charArray = {};
    strval(e).split('').forEach((e) => {
        if (in_array(e, ['-', '/'])) {
            e = '\\' + e;
        }
        charArray[e] = e;
    });
    let regex = `[${values(charArray).join('')}]`;
    switch (lower_trim(position)) {
        case 'start':
            return new RegExp(`^${regex}+`, 'g');
        case 'end':
            return new RegExp(`${regex}+$`, 'g');
        default:
            return new RegExp(`^${regex}+|${regex}+$`, 'g');
    }
}

// JSON
let json_last_error_message = '';
let json_last_error_code = 0;
export const JSON_PRETTY_PRINT = 128;
export const JSON_UNESCAPED_UNICODE = 256;
export const JSON_UNESCAPED_SLASHES = 64;
export const JSON_ERROR_NONE = 0;

export const Base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
export const Base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
// noinspection RegExpRedundantEscape
export const RegexEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
// username is start & end with alphanumeric, and only contains alphanumeric & underscore only
// minimum 3 characters & maximum 120 ((?i)[a-z0-9][a-zA-Z0-9_]{1,118}[0-9a-zA-Z])
// 118 = 120 - 2 ( 2 as start & end )
export const RegexUsername = /^[a-zA-Z0-9][a-zA-Z0-9_]{1,118}[0-9a-zA-Z]$/;

export const filter_username = (value) => is_string(value) ? value.replace(/[^a-zA-Z0-9_\-.@]/g, '') : '';
export const get_object_type = (e) => Object.prototype.toString.call(e).slice(8, -1);
export const object_type_is = (e, type) => get_object_type(e) === is_string(type) ? type : (is_function(type) ? type.name : get_object_type(type));
export const gettype = (e) => get_object_type(e).toLowerCase();
export const is_browser = () => (is_object(window)
    && is_object(window.document)
    && is_object(window.location)
    && is_object(window.navigator)
    && is_string(window.navigator.userAgent)
    && is_string(window.location.href)
    && is_string(window.location.protocol)
    && is_string(window.location.origin)
    && is_string(window.location.hostname)
    && is_string(window.location.pathname)
    && is_function(window.document.createElement)
    && is_function(window.document.addEventListener)
    && is_function(window.document.removeEventListener)
    && is_function(window.document.querySelector)
    && is_function(window.document.querySelectorAll)
    && window.document.documentElement instanceof Element);

/* VALIDATION */
export const is_valid_username = (value) => !is_string(value) || value.length < 3 || value.length > 120 ? false : (is_email(value) || is_username(value));
export const is_email = (e) => !is_string(e) || !e.includes('@') ? false : RegexEmail.test(e);
export const is_username = (e) => !is_string(e) ? false : RegexUsername.test(e);
export const is_boolean = (e) => typeof e === 'boolean';
export const is_object = (e) => !!(e && typeof e === 'object');
export const is_real_object = (e) => gettype(e) === 'object';
export const is_string = (e) => gettype(e) === 'string';
export const is_hex = (e) => is_string(e) && /^[0-9a-fA-F]+$/.test(e);
export const is_md5 = (e) => is_string(e) && /^[0-9a-f]{32}$/.test(e);
export const is_sha1 = (e) => is_string(e) && /^[0-9a-f]{40}$/.test(e);
export const is_sha256 = (e) => is_string(e) && /^[0-9a-f]{64}$/.test(e);
export const is_sha512 = (e) => is_string(e) && /^[0-9a-f]{128}$/.test(e);
export const is_null = (e) => e === null;
export const is_real_string = (e) => (typeof e === 'string');
export const is_array = (e) => Array.isArray(e);
export const is_function = (e) => gettype(e) === 'function';
export const is_scalar = (e) => is_string(e) || is_number(e) || is_boolean(e);
export const is_async_function = (e) => !!(is_function(e) && e.constructor.name === 'AsyncFunction');
export const is_arrow_function = (e) => !!(is_function(e) && !e.name && e.toString().includes('=>') && !is_normal_function(e));
export const is_normal_function = (e) => !!(is_function(e) && e.prototype && e.prototype.constructor && e.toString().toLowerCase().startsWith('function'));
export const is_native_function = (e) => is_normal_function(e) && /\)\s*{\s+\[native\s+code]\s*}$/g.test(e.toString());
export const is_number = (e) => !!(typeof e === 'number' && !isNaN(e) && e !== isFinite(e));
export const is_numeric = (e) => is_number(e) || !!(is_string(e) && is_match(/^[0-9]+(\.[0-9]+)?$/, e));
export const is_nan = (e) => typeof e === "number" && isNaN(e);
export const is_finite = (e) => typeof e === "number" && e !== 0 && isFinite(e);
export const is_float = (e) => is_number(e) && e.toString().includes('.');
export const is_double = is_float;
export const is_int = (e) => !!(is_number(e) && !e.toString().includes('.'));
export const is_integer = is_int;
export const is_regex = (e) => e instanceof RegExp;
export const is_match = (regex, e) => is_string(e) && is_regex(regex) && regex.test(e);
export const is_identical = (a, b) => a === b;
export const is_equal = (a, b) => is_numeric(a) && is_numeric(b) && a >= b && a <= b;
export const is_not_equal = (a, b) => is_numeric(a) && is_numeric(b) && (a > b || a < b);
export const is_greater_than = (a, b) => is_numeric(a) && is_numeric(b) && a > b;
export const is_greater_than_or_equal = (a, b) => is_numeric(a) && is_numeric(b) && a >= b;
export const is_less_than = (a, b) => is_numeric(a) && is_numeric(b) && a < b;
export const is_less_than_or_equal = (a, b) => is_numeric(a) && is_numeric(b) && a <= b;
export const is_between = (a, b, c) => is_numeric(a) && is_numeric(b) && is_numeric(c) && a >= b && a <= c;
export const is_undefined = (e) => e === undefined;
export const is_empty_array = (e) => is_array(e) && e.length === 0;
export const is_empty_object = (e) => is_object(e) && count(e) === 0;
export const is_empty_string = (e) => is_string(e) && e === '';
export const is_not_empty_string = (e) => is_string(e) && e !== '';
export const is_numeric_integer = (e) => is_numeric(e) && !str_contains(strval(e), '.');
export const is_numeric_float = (e) => is_numeric(e) && str_contains(strval(e), '.');
export const is_uuid = (e) => uuid_version(e) !== null;
export const is_instance_of = (e, mode) => {
    if (is_string(mode)) {
        if (is_string(e)) {
            return e === mode;
        }
        if (is_object(e)) {
            return is_object(e.constructor) && e.constructor.name === mode;
        }
        return false;
    }
    if (!is_normal_function(mode)
        || !mode.constructor
        || is_object(mode.prototype)
        || mode.constructor.name !== mode.name
    ) {
        return false;
    }
    try {
        return (e instanceof mode);
    } catch (e) {
        return false;
    }
}
export const is_a = is_instance_of;
export const is_json = (e) => {
    if (!is_string(e)) {
        return false;
    }
    if (e === 'null' || e === '[]' || e === '{}') {
        return true;
    }
    if ((str_starts_with(e, '{') && str_starts_with(e, '}'))
        || str_starts_with(e, '[') && str_starts_with(e, ']')) {
        try {
            JSON.parse(e);
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}
export const is_form_params = (e) => {
    if (!is_string(e)) {
        return false;
    }
    if (!e.includes('&') || !e.includes('=')) {
        return false;
    }
    // split
    let split = e.split('&');
    for (let i = 0; i < split.length; i++) {
        let item = split[i].split('=');
        if (item.length !== 2) {
            return false;
        }
    }
    return true;
}

/* VALIDATE */
export const isset = (e) => !is_undefined(e) && !is_null(e);
export const empty = (e) => !!(!isset(e) || e === '' || e === 0 || e === false || e === null || is_object(e) && count(e) === 0 || is_array(e) && e.length === 0);
export const rand = (min, max) => Math.floor(is_int(min) && is_int(max) ? (Math.random() * (max - min + 1) + min) : (Math.random() * 10));
export const mt_rand = rand;
export const use_object = (e, def = {}) => is_object(e) ? e : (is_object(def) ? def : {});
/* CASTING */
export const intval = (e) => parseInt(strval(e))
export const floatval = (e) => parseFloat(strval(e));
export const boolval = (e) => !!e;
export const numberval = (e) => is_numeric(e) ? (strval(e).includes('.') && !/\.0+$/.test(e) ? floatval(e) : intval(e)) : 0;

/**
 * Convert any to string
 * @param {any} e
 * @returns {string} Infinity and Name is always empty
 */
export const strval = (e) => {
    if (typeof e === 'number') {
        return e.toString();
    }
    if (e === undefined || e === false || e === '' || is_nan(e) || is_finite(e)) {
        return '';
    }
    if (is_string(e)) {
        return e;
    }
    try {
        return e.toString();
    } catch (e) {
        return '';
    }
}
/**
 * Convert any to object
 * @param {any} e
 * @returns {object|{}}
 */
export const objectval = (e) => {
    if (!is_object(e)) {
        return {};
    }
    return e;
}

/* STRING */
export const lower = (e) => strval(e).toLowerCase();
export const upper = (e) => strval(e).toUpperCase();
export const lower_trim = (e) => lower(e).trim();
export const upper_trim = (e) => upper(e).trim();
export const str_contains = (e, search) => is_string(e) && is_string(search) && e.includes(search);
export const str_contain_binary = (e) => /[^\x20-\x7E\t\r\n]/g.test(strval(e));
export const str_starts_with = (e, search) => is_string(e) && is_string(search) && e.startsWith(search);
export const str_ends_with = (e, search) => is_string(e) && is_string(search) && e.endsWith(search);
export const str_replace = (search, replace, e) => is_string(e) && is_string(search) && is_string(replace) ? e.replace(search, replace) : e;
export const str_replace_all = (search, replace, e) => is_string(e) && is_string(search) && is_string(replace) ? e.replaceAll(search, replace) : e;
export const str_split = (e, separator) => is_string(e) && is_string(separator) ? e.split(separator) : [];

export const str_repeat = (e, count) => is_string(e) && is_int(count) && count > 0 ? e.repeat(count) : '';
export const str_shuffle = (e) => is_string(e) ? e.split('').sort(() => 0.5 - Math.random()).join('') : '';
export const ucwords = (e, separator = " \t\r\n\f\v") => {
    separator = empty(separator) ? " \t\r\n\f\v" : separator;
    const regx = new RegExp(`([${separator}]|^)([^${separator}])`, 'g');
    return e.replace(regx, (a, b, c) => (b || '') + c.toUpperCase());
}
export const lcwords = (e, separator = " \t\r\n\f\v") => {
    separator = empty(separator) ? " \t\r\n\f\v" : separator;
    const regx = new RegExp(`([${separator}]|^)([^${separator}])`, 'g');
    return strval(e).replace(regx, (a, b, c) => (b || '') + c.toLowerCase());
}

export const trim = (e, separator = " \t\r\n\f\v") => {
    let str = strval(e);
    if (!is_string(separator) || empty(separator)) {
        return str.trim();
    }
    return str.replace(createTrimRegexP(separator, 'both'), '');
}

export const ltrim = (e, separator = " \t\r\n\f\v") => {
    let str = strval(e);
    if (!is_string(separator) || empty(separator)) {
        return str.trimStart();
    }
    return str.replace(createTrimRegexP(separator, 'start'), '');
}
export const rtrim = (e, separator = " \t\r\n\f\v") => {
    let str = strval(e);
    if (!is_string(separator) || empty(separator)) {
        return str.trimEnd();
    }
    return str.replace(createTrimRegexP(separator, 'start'), '');
}
export const str_pad = (e, length, pad = ' ', type = 'right') => {
    e = strval(e);
    if (e.length >= length) {
        return e;
    }
    const padLength = length - e.length;
    const padString = pad.repeat(padLength);
    switch (type) {
        case 'right':
            return e + padString;
        case 'left':
            return padString + e;
        case 'both':
            return padString.slice(0, Math.ceil(padLength / 2)) + e + padString.slice(0, Math.floor(padLength / 2));
        default:
            return e;
    }
}
export const ucfirst = (e) => {
    e = strval(e);
    if (e === '') {
        return '';
    }
    return upper(e.charAt(0)) + (e.slice(1) || '')
}

export const lcfirst = (e) => {
    e = strval(e);
    if (e === '') {
        return '';
    }
    return e.charAt(0).toLowerCase() + (e.slice(1) || '')
}

/* ARRAY */
export const keys = (e) => is_object(e) ? Object.keys(e) : [];
export const values = (e) => is_object(e) ? Object.values(e) : [e];
export const count = (e) => is_object(e) ? Object.keys(e).length : 0;
export const in_array = (e, array) => is_array(array) && array.includes(e);
export const array_change_key_case = (e, mode = 'lower') => {
    if (!is_object(e)) {
        return {};
    }
    const array = {};
    each(e, (key, value) => {
        key = is_string(key) ? (mode === 'upper' ? upper(key) : lower(key)) : key;
        array[key] = value;
    });
    return array;
}
export const array_chunk = (e, size) => {
    if (!is_array(e) || !is_int(size) || size < 1) {
        return [];
    }
    const array = [];
    for (let i = 0; i < e.length; i += size) {
        array.push(e.slice(i, i + size));
    }
    return array;
}
export const array_column = (e, column, key = null) => {
    if (!is_array(e) || !is_string(column)) {
        return [];
    }
    const array = [];
    each(e, (k, value) => {
        if (is_object(value) && isset(value[column])) {
            array[key ? value[key] : k] = value[column];
        }
    });
    return array;
}
export const uasort = (e, callback) => {
    if (!is_array(e) || !is_function(callback)) {
        return [];
    }
    e.sort((a, b) => callback(a, b));
    return e;
}
export const sort = (e, callback) => {
    if (!is_array(e) || !is_function(callback)) {
        return [];
    }
    e.sort((a, b) => callback(a, b));
    return e;
}
export const asort = (e) => {
    if (!is_object(e)) {
        return {};
    }
    const array = {};
    Object.keys(e).sort().forEach((key) => array[key] = e[key]);
    return array;
}
export const array_unique = (e) => {
    if (!is_array(e)) {
        return [];
    }
    return [...new Set(e)];
}
export const array_values = (e) => values(e);
export const array_keys = (e) => keys(e);
export const array_flip = (e) => {
    if (!is_object(e)) {
        return {};
    }
    const array = {};
    each(e, (key, value) => array[value] = key);
    return array;
}
export const array_reverse = (e, preserve_keys = false) => {
    if (!is_array(e)) {
        return [];
    }
    return e.reverse();
}
export const array_map = (e, callback) => {
    if (!is_array(e) || !is_function(callback)) {
        return [];
    }
    return e.map(callback);
}
export const array_filter = (e, callback) => {
    if (!is_array(e) || !is_function(callback)) {
        return [];
    }
    return e.filter(callback);
}
export const array_merge = (...e) => {
    const array = [];
    e.forEach((e) => {
        if (is_array(e)) {
            array.push(...e);
        }
    });
    return array;
}
export const array_merge_recursive = (...e) => {
    const array = {};
    e.forEach((e) => {
        if (is_object(e)) {
            each(e, (key, value) => {
                if (is_object(value)) {
                    array[key] = array_merge_recursive(array[key], value);
                } else {
                    array[key] = value;
                }
            });
        }
    });
    return array;
}
export const array_intersect = (...e) => {
    if (!is_array(e)) {
        return [];
    }
    const array = e.shift();
    return array.filter((value) => e.every((e) => e.includes(value)));
}
export const array_diff = (...e) => {
    if (!is_array(e)) {
        return [];
    }
    const array = e.shift();
    return array.filter((value) => e.every((e) => !e.includes(value)));
}
export const array_diff_assoc = (...e) => {
    if (!is_array(e)) {
        return [];
    }
    const array = e.shift();
    return array.filter((value) => e.every((e) => !isset(e[value])));
}
export const array_diff_key = (...e) => {
    if (!is_array(e)) {
        return [];
    }
    const array = e.shift();
    return array.filter((value) => e.every((e) => !isset(e[value])));
}
export const array_diff_uassoc = (e, ...args) => {
    if (!is_array(e)) {
        return [];
    }
    const callback = args.pop();
    return e.filter((value) => args.every((e) => !isset(callback(value, e))));
}
export const reset = (e) => {
    if (!is_object(e)) {
        return null;
    }
    e = values(e);
    return e.length === 0 ? null : e[0];
};

/* MISCELLANEOUS */

/**
 * Select element
 * @param selector
 * @param element
 * @returns {NodeListOf<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>|Element[]|*[]}
 */
export const select = (selector, element) => {
    if (selector instanceof Element) {
        return [selector];
    }
    if (!is_string(selector)) {
        return [];
    }
    if (!(element instanceof Element) && window && window.document && window.document.querySelector) {
        element = window.document;
    }
    if (!element || typeof element.querySelectorAll !== 'function') {
        return [];
    }
    try {
        return element.querySelectorAll(selector);
    } catch (err) {
        return [];
    }
}

export const uuid_v4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
/**
 * Check uuid version, support only version 1 to 5
 * @param e
 * @returns {number|null}
 */
export const uuid_version = (e) => {
    if (!is_string(e)) {
        return null;
    }
    const match = e.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    return match ? intval(match[1]) : null;
}
/**
 * Encode params
 * @param {any} obj
 * @returns {string}
 */
export const encode_param = (obj) => {
    let str = [];
    if (!is_object(obj)) {
        return is_string(obj) ? obj : '';
    }
    // make php compatible object like
    // name[]=value1&name[]=value2&name1[][]=&
    for (let p in obj) {
        if (!obj.hasOwnProperty(p)) {
            continue;
        }
        // check if object
        if (is_object(obj[p])) {
            // check if array
            if (Array.isArray(obj[p])) {
                for (let i = 0; i < obj[p].length; i++) {
                    let val = obj[p][i];
                    val = !val && !is_number(val);
                    val = is_object(val) ? encode_param(val) : encodeURIComponent(val);
                    str.push(encodeURIComponent(p) + '[]=' + val);
                }
            } else {
                // check if object
                for (let k in obj[p]) {
                    if (!obj[p].hasOwnProperty(k)) {
                        continue;
                    }
                    let val = obj[p][k];
                    val = !val && !is_number(val);
                    val = is_object(val) ? encode_param(val) : encodeURIComponent(val);
                    str.push(encodeURIComponent(p) + '[' + encodeURIComponent(k) + ']=' + val);
                }
            }
        } else {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(strval(obj[p])));
        }
    }
    return str.join('&');
}
export const http_build_query = encode_param;

/**
 * Parse string to object
 * @param {string} str
 * @param {object} array
 * @returns {object}
 */
export const parse_str = (str, array = {}) => {
    array = {};
    if (!is_string(str)) {
        return array;
    }
    str.split('&').forEach((e) => {
        let list = e.split('=');
        const key = decodeURIComponent(list.shift().toString());
        const value = decodeURIComponent(list.join('='));
        if (key.includes('[')) {
            let keys = key.split('[');
            let last = keys.pop();
            let obj = array;
            keys.forEach((k) => {
                if (!isset(obj[k])) {
                    obj[k] = {};
                }
                obj = obj[k];
            });
            obj[last] = value;
        } else {
            array[key] = value;
        }
    });
    return array;
}
export const json_last_error = () => json_last_error_code;
export const json_last_error_msg = () => json_last_error_message;
/**
 * Parse JSON string to object
 * @param {any} e
 * @param {number} options
 * @returns {string|boolean} false if failed
 */
export const json_encode = (e, options = JSON_ERROR_NONE) => {
    json_last_error_message = '';
    json_last_error_code = 0;
    let prettify = false,
        is_escaped = false,
        unescaped_unicode = false;
    if (is_int(options)) {
        prettify = (options & JSON_PRETTY_PRINT) === JSON_PRETTY_PRINT;
        is_escaped = (options & ~JSON_UNESCAPED_SLASHES) === ~JSON_UNESCAPED_SLASHES;
        unescaped_unicode = (options & JSON_UNESCAPED_UNICODE) === JSON_UNESCAPED_UNICODE;
    }
    let result;
    try {
        result = JSON.stringify(e, null, prettify ? 4 : null);
    } catch (e) {
        json_last_error_code = e.code;
        json_last_error_message = e.message;
        return false;
    }
    if (is_escaped) {
        result = result.replace(/\\([^\\])/g, '$1');
    }
    if (unescaped_unicode) {
        result = result.replace(/\\u([0-9a-fA-F]{4})/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    return result;
}
/**
 * Convert string to binary string
 *
 * @param {any|number|string} e if numeric convert to integer, or invalid number or empty is 0
 * @returns {string} represent as binary string (1 & 0)
 */
export const binary_number = (e) => {
    const type = typeof e;
    let pad = '0';
    let n = type === "number"
        ? parseInt(e.toString())
        : (
            type !== 'string' || !/^[0-9]+(?:\.[0-9]+)?$/.test(e)
                ? 0
                : parseInt(e)
        );
    if (n < 1) {
        n = Number.MAX_SAFE_INTEGER + n + 1;
        pad = 1;
    }

    n = n === 0 ? '0' : n.toString(2).padStart(64, pad).replace(/^0+/g, '');
    return n || '0';
}

/**
 * Convert string to integer signed ascii
 * @param e
 * @returns {number}
 */
const integer_signed_ascii = (e) => {
    const type = typeof e;
    if (type === "number") {
        const val = parseInt(e.toString()) % 256;
        return (val < 0 ? 256 + val : val) % 256;
    }
    // if is not string and is not start with number
    if (type !== "string" || !/^[0-9]/.test(e)) {
        return 0;
    }
    // just get starting number
    e = parseInt(e.replace(/^([0-9]+)(?:[^0-9]+.*)?$/, '$1'));
    return integer_signed_ascii(e);
}

/**
 * @param text
 * @param args
 * @returns {string}
 */
export const sprintf = (text, ...args) => {
    text = strval(text);
    if (text === '') {
        return "";
    }
    args = Object.values(args);
    let i = 0;
    const F = (e) => floatval(e).toString().padEnd(4, '0');
    const callback = {
        d: intval,
        b: binary_number,
        F,
        f: F,
        x: (e) => bin2hex(e).toLowerCase(),
        X: (e) => bin2hex(e).toUpperCase(),
        c: integer_signed_ascii
    };
    return text.replace(
        /%([%sdbFfxXc])/g,
        function (m) {
            if (m[1] === '%') {
                return '%';
            }
            const k = i;
            i++
            const val = args.length > k ? args[k] : '';
            return callback[m[1]] ? callback[m[1]](val) : val;
        }
    );
}

/**
 * Binary to hex
 * @param s
 * @returns {string}
 */
export const bin2hex = (s) => {
    s = s instanceof ArrayBuffer ? new Uint8Array(s) : s;
    try {
        const bytes = s instanceof Uint8Array ? s : (new TextEncoder()).encode(s);
        const hex = [];
        for (let byte of bytes) {
            hex.push(byte.toString(16).padStart(2, '0'));
        }
        return hex.join('');
    } catch (err) {
        return '';
    }
}

/**
 * Buffer to hex
 * @param buffer
 * @returns {string}
 */
export const buffer2hex = (buffer) => { // buffer is an ArrayBuffer
    // noinspection JSCheckFunctionSignatures
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Hex to binary
 *
 * @param {string|String} s
 * @returns {string|boolean}
 */
export const hex2bin = (s) => {
    const ret = []
    let i = 0
    let l
    s += '';
    for (l = s.length; i < l; i += 2) {
        const c = parseInt(s.substring(i, 1), 16)
        const k = parseInt(s.substring(i + 1, 1), 16)
        if (isNaN(c) || isNaN(k)) {
            return false;
        }
        ret.push((c << 4) | k)
    }

    return String.fromCharCode.apply(String, ret)
}

/**
 * Decode surrogate pair
 *
 * @param {string} e
 * @param {number} i
 * @returns {[number,undefined]}
 */
export const utf16_decode_pair = (e, i) => {
    if (!is_number(i) || !is_string(e)) {
        return [
            0,
            i
        ]
    }
    let x = e.charCodeAt(i);
    let y = i + 1 < e.length ? e.charCodeAt(i + 1) : 0;
    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
        i++;
    }
    return [
        x,
        i
    ];
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 * @param {string|*} e
 * @returns {string}
 */
export const utf8_encode = (e) => {
    e = strval(e);
    let output = "",
        i = -1,
        x;

    while (++i < e.length) {
        /* Decode utf-16 surrogate pairs */
        [x, i] = utf16_decode_pair(e, i);

        /* Encode output as utf-8 */
        if (x <= 0x7F) {
            output += String.fromCharCode(x);
        } else if (x <= 0x7FF) {
            output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                0x80 | (x & 0x3F));
        } else if (x <= 0xFFFF) {
            output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                0x80 | ((x >>> 6) & 0x3F),
                0x80 | (x & 0x3F));
        } else if (x <= 0x1FFFFF) {
            output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                0x80 | ((x >>> 12) & 0x3F),
                0x80 | ((x >>> 6) & 0x3F),
                0x80 | (x & 0x3F));
        }
    }
    return output;
}

/**
 * Decode utf-16 string.
 * @param {string|*} e
 * @returns {string}
 */
export const utf16_decode = (e) => {
    e = strval(e);
    let output = "",
        i = 0,
        x, y;

    while (i < e.length) {
        x = e.charCodeAt(i);
        if (x < 0x80) {
            output += String.fromCharCode(x);
            i++;
        } else if (x > 191 && x < 224) {
            y = e.charCodeAt(i + 1);
            output += String.fromCharCode(((x & 31) << 6) | (y & 63));
            i += 2;
        } else {
            y = e.charCodeAt(i + 1);
            output += String.fromCharCode(((x & 15) << 12) | ((y & 63) << 6) | (e.charCodeAt(i + 2) & 63));
            i += 3;
        }
    }

    return output;
}

/**
 * Encode a string as utf-16.
 * @param {string|*} e
 * @returns {string}
 */
export const utf16_encode = (e) => {
    e = strval(e);
    let output = "",
        i = -1,
        x;
    while (++i < e.length) {
        /* Decode utf-16 surrogate pairs */
        [x, i] = utf16_decode_pair(e, i);
        output += String.fromCharCode(x);
    }
    return output;
}

/**
 * Loop through object
 * @param {object} object
 * @param {function} callback
 */
export const each = (object, callback) => {
    if (!is_object(object)) {
        return {};
    }
    if (!is_function(callback)) {
        return object;
    }
    for (let key in object) {
        if (!object.hasOwnProperty(key)) {
            continue;
        }
        if (is_async_function(callback)) {
            callback(key, object[key]).then(e => e).catch(e => e);
            continue;
        }
        callback(key, object[key]);
    }

    return object;
}

/* ENCODE */
/**
 * Encode base64 string
 * @param {string} string
 * @returns {string}
 */
export const base64_encode = (string) => {
    if (!is_string(string)) {
        return '';
    }

    let result = '';
    let i = 0;
    do {
        let a = string.charCodeAt(i++);
        let b = string.charCodeAt(i++);
        let c = string.charCodeAt(i++);

        a = a ? a : 0;
        b = b ? b : 0;
        c = c ? c : 0;

        const b1 = (a >> 2) & 0x3F;
        const b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
        let b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
        let b4 = c & 0x3F;

        if (!b) {
            b3 = b4 = 64;
        } else if (!c) {
            b4 = 64;
        }

        result += Base64Chars.charAt(b1) + Base64Chars.charAt(b2) + Base64Chars.charAt(b3) + Base64Chars.charAt(b4);

    } while (i < string.length);

    return result;
}

/**
 * Decode base64 string
 * @param {string} string
 * @returns {string}
 */
export const base64_decode = (string) => {
    if (!is_string(string)) {
        return '';
    }

    let result = '';

    let i = 0;
    do {
        const b1 = Base64Chars.indexOf(string.charAt(i++));
        const b2 = Base64Chars.indexOf(string.charAt(i++));
        const b3 = Base64Chars.indexOf(string.charAt(i++));
        const b4 = Base64Chars.indexOf(string.charAt(i++));

        const a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3);
        const b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF);
        const c = ((b3 & 0x3) << 6) | (b4 & 0x3F);

        result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');

    } while (i < string.length);

    return result;
}
/**
 * Encode base32 string
 * @param {string} string
 * @returns {string}
 */
export const base32_encode = (string) => {
    if (!is_string(string)) {
        return '';
    }

    let result = '';
    let i = 0;
    do {
        let a = string.charCodeAt(i++),
            b = string.charCodeAt(i++),
            c = string.charCodeAt(i++);

        a = a ? a : 0;
        b = b ? b : 0;
        c = c ? c : 0;

        const b1 = (a >> 3) & 0x1F;
        const b2 = ((a & 0x7) << 2) | ((b >> 6) & 0x3);
        const b3 = (b >> 1) & 0x1F;
        let b4 = ((b & 0x1) << 4) | ((c >> 4) & 0xF);
        let b5 = ((c & 0xF) << 1);

        if (!b) {
            b4 = b5 = 32;
        } else if (!c) {
            b5 = 32;
        }

        result += Base32Chars.charAt(b1) + Base32Chars.charAt(b2) + Base32Chars.charAt(b3) + Base32Chars.charAt(b4) + Base32Chars.charAt(b5);

    } while (i < string.length);

    return result;
}

/**
 * Decode base32 string
 * @param {string} string
 * @returns {string}
 */
export const base32_decode = (string) => {
    if (!is_string(string)) {
        return '';
    }

    let result = '';

    let i = 0;
    do {
        const b1 = Base32Chars.indexOf(string.charAt(i++));
        const b2 = Base32Chars.indexOf(string.charAt(i++));
        const b3 = Base32Chars.indexOf(string.charAt(i++));
        const b4 = Base32Chars.indexOf(string.charAt(i++));
        const b5 = Base32Chars.indexOf(string.charAt(i++));

        const a = ((b1 & 0x1F) << 3) | ((b2 >> 2) & 0x7);
        const b = ((b2 & 0x3) << 6) | ((b3 & 0x1F) << 1) | ((b4 >> 4) & 0x1);
        const c = ((b4 & 0xF) << 4) | ((b5 >> 1) & 0xF);

        result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');

    } while (i < string.length);

    return result;
}

/**
 * Clone object
 * @template T of any
 *
 * @param {T} object
 * @returns {T}
 */
export const clone = (object) => {
    if (!object || !is_object(object)) {
        return object;
    }

    const cloned = is_array(object) ? [] : {};
    each(object, (
        key,
        value
    ) => cloned[key] = is_object(value) ? clone(value) : value);
    return cloned;
}

/**
 * Copy text to clipboard
 * @param {Blob|string|*} blob
 * @returns {Promise<void>}
 */
export const save_to_clipboard = (blob) => {
    if (!is_object(window)
        || !is_object(window.navigator)
        || !is_object(window.navigator.clipboard)
        || !is_function(window.navigator.clipboard.write)
    ) {
        return Promise.reject('Window navigator clipboard not supported');
    }
    const clipboard = window.navigator.clipboard;
    const isSecure = /^https/i.test(window.location.protocol);

    const mime = (mime) => {
        switch (mime) {
            case 'image/png':
            case 'text/plain':
            case 'text/html':
                return mime;
            default:
                return 'text/plain';
        }
    };
    return new Promise((resolve) => {
        const serve = (type, blob) => {
            if (isSecure) {
                type = mime(type);
                return clipboard.write([new ClipboardItem({[type]: blob})]);
            }
            return clipboard.writeText(blob);
        }
        if (blob instanceof File) {
            const type = blob.type || 'application/octet-stream';
            blob.text().then((e) => {
                if (!isSecure) {
                    return resolve(serve(e));
                }
                resolve(new Blob([e], {type}));
            });
            return;
        }
        if ((blob instanceof Blob)) {
            resolve(blob, blob.type);
            return;
        }
        if ((blob instanceof Promise) || is_async_function(blob)) {
            blob.then((e) => resolve(serve(strval(e))));
            return;
        }

        if (is_function(blob)) {
            blob = strval(blob);
        }
        return resolve(serve(blob));
    });
}

/**
 * Disable react dev tools
 */
export const disable_react_dev_tools = () => {
    // Check if the React Developer Tools global hook exists
    if (!is_object(window) || !is_object(window['__REACT_DEVTOOLS_GLOBAL_HOOK__'])) {
        return;
    }
    each(window['__REACT_DEVTOOLS_GLOBAL_HOOK__'], (key) => {
        if (key === "renderers") {
            window['__REACT_DEVTOOLS_GLOBAL_HOOK__'][key] = new Map();
            return;
        }
        // Replace all of its properties with a no-op function or a null value
        // depending on their types

        window['__REACT_DEVTOOLS_GLOBAL_HOOK__'][key] =
            typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'][key] === "function"
                ? () => {
                }
                : null;
    });
}

// add exported constants on this file to default export
export default {
    JSON_PRETTY_PRINT,
    JSON_ERROR_NONE,
    JSON_UNESCAPED_SLASHES,
    JSON_UNESCAPED_UNICODE,
    Base64Chars,
    Base32Chars,
    RegexEmail,
    RegexUsername,
    is_browser,
    filter_username,
    get_object_type,
    object_type_is,
    gettype,
    is_valid_username,
    is_email,
    is_username,
    is_boolean,
    is_object,
    is_real_object,
    is_string,
    is_hex,
    is_md5,
    is_sha1,
    is_sha256,
    is_sha512,
    is_null,
    is_real_string,
    is_array,
    is_function,
    is_scalar,
    is_async_function,
    is_arrow_function,
    is_normal_function,
    is_native_function,
    is_number,
    is_numeric,
    is_nan,
    is_finite,
    is_float,
    is_double,
    is_int,
    is_integer,
    is_regex,
    is_match,
    is_identical,
    is_equal,
    is_not_equal,
    is_greater_than,
    is_greater_than_or_equal,
    is_less_than,
    is_less_than_or_equal,
    is_between,
    is_undefined,
    isset,
    is_empty_array,
    is_empty_object,
    is_empty_string,
    is_not_empty_string,
    is_numeric_integer,
    is_numeric_float,
    is_uuid,
    is_json,
    is_form_params,
    empty,
    rand,
    mt_rand,
    use_object,
    json_encode,
    json_last_error_msg,
    json_last_error,
    intval,
    floatval,
    boolval,
    numberval,
    strval,
    objectval,
    lower,
    upper,
    lower_trim,
    upper_trim,
    str_contains,
    str_contain_binary,
    str_starts_with,
    str_ends_with,
    str_replace,
    str_replace_all,
    str_split,
    str_repeat,
    str_shuffle,
    ucwords,
    lcwords,
    trim,
    ltrim,
    rtrim,
    str_pad,
    ucfirst,
    lcfirst,
    keys,
    values,
    count,
    in_array,
    array_change_key_case,
    array_chunk,
    array_column,
    uasort,
    sort,
    asort,
    array_unique,
    array_values,
    array_keys,
    array_flip,
    array_reverse,
    array_map,
    array_filter,
    array_merge,
    array_merge_recursive,
    array_intersect,
    array_diff,
    array_diff_assoc,
    array_diff_key,
    array_diff_uassoc,
    reset,
    select,
    uuid_v4,
    uuid_version,
    encode_param,
    http_build_query,
    parse_str,
    binary_number,
    is_instance_of,
    is_a,
    sprintf,
    bin2hex,
    buffer2hex,
    hex2bin,
    utf16_decode_pair,
    utf8_encode,
    utf16_decode,
    utf16_encode,
    each,
    base64_encode,
    base64_decode,
    base32_encode,
    base32_decode,
    clone,
    save_to_clipboard,
    disable_react_dev_tools,
}
