import {is_string, upper_trim} from "./Helper";
import md5, {hmac_md5} from "./Hash/Md5.js";
import sha1, {hmac_sha1} from "./Hash/Sha1.js";
import sha256, {hmac_sha256} from "./Hash/Sha256.js";
import sha512, {hmac_sha512} from "./Hash/Sha512.js";

export const hash = (algo, data, raw = false) => {
    if (!is_string(algo)) {
        return null;
    }
    algo = upper_trim(algo);
    switch (algo) {
        case 'MD5':
        case 'MD-5':
            return md5(data, raw);
        case 'SHA1':
        case 'SHA-1':
            return sha1(data, raw);
        case 'SHA256':
        case 'SHA-256':
            return sha256(data, raw);
        case 'SHA512':
        case 'SHA-512':
            return sha512(data, raw);
        default:
            return null;
    }
}
export const hash_hmac = (algo, data, key, raw = false) => {
    if (!is_string(algo)) {
        return null;
    }
    algo = upper_trim(algo);
    switch (algo) {
        case 'MD5':
        case 'MD-5':
            return hmac_md5(data, key, raw);
        case 'SHA1':
        case 'SHA-1':
            return hmac_sha1(data, key, raw);
        case 'SHA256':
        case 'SHA-256':
            return hmac_sha256(data, key, raw);
        case 'SHA512':
        case 'SHA-512':
            return hmac_sha512(data, key, raw);
        default:
            return null;
    }
}

export md5 from "./Hash/Md5.js";
export sha1 from "./Hash/Sha1.js";
export sha256 from "./Hash/Sha256.js";
export sha512 from "./Hash/Sha512.js";
export hmac_md5 from "./Hash/Md5.js";
export hmac_sha1 from "./Hash/Sha1.js";
export hmac_sha256 from "./Hash/Sha256.js";
export hmac_sha512 from "./Hash/Sha512.js";

export default {
    hash,
    hash_hmac,
    md5,
    sha1,
    sha256,
    sha512,
    hmac_md5,
    hmac_sha1,
    hmac_sha256,
    hmac_sha512
}