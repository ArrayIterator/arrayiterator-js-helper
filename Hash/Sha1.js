/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit-length
 */
import {strval, utf8_encode} from "../Helper";
import {bigEndian2Hex, bigEndian2Str, rotateLeft, safeAdd16, str2BigEndian} from "./EndianUtil.js";

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d) {
    if (t < 20) {
        return (b & c) | ((~b) & d);
    }
    if (t < 40) {
        return b ^ c ^ d;
    }
    if (t < 60) {
        return (b & c) | (b & d) | (c & d);
    }
    return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
        (t < 60) ? -1894007588 : -899497514;
}

function core_sha1(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    let w = Array(80),
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878,
        e = -1009589776;

    for (let i = 0; i < x.length; i += 16) {
        let oldA = a,
            oldB = b,
            oldC = c,
            oldD = d,
            oldE = e;

        for (let j = 0; j < 80; j++) {
            w[j] = j < 16 ? x[i + j] : rotateLeft(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            let t = safeAdd16(
                safeAdd16(rotateLeft(a, 5), sha1_ft(j, b, c, d)),
                safeAdd16(safeAdd16(e, w[j]), sha1_kt(j))
            );
            e = d;
            d = c;
            c = rotateLeft(b, 30);
            b = a;
            a = t;
        }

        a = safeAdd16(a, oldA);
        b = safeAdd16(b, oldB);
        c = safeAdd16(c, oldC);
        d = safeAdd16(d, oldD);
        e = safeAdd16(e, oldE);
    }
    return [a, b, c, d, e];

}

export const sha1 = (str, raw = false) => {
    str = typeof str === 'boolean' ? (str ? '1' : '0') : strval(str);
    return !raw
        ? bigEndian2Hex(core_sha1(str2BigEndian(str), str.length * 8))
        : bigEndian2Str(core_sha1(str2BigEndian(str), str.length * 8));
}

export const hmac_sha1 = (data, key, raw = false) => {
    data = typeof data === 'boolean' ? (data ? '1' : '0') : strval(data);
    data = utf8_encode(data);
    let bKey = str2BigEndian(key),
        i;
    if(bKey.length > 16) {
        bKey = core_sha1(bKey, key.length * 8);
    }

    const ipad = Array(16), pad = Array(16);
    for(i = 0; i < 16; i++) {
        ipad[i] = bKey[i] ^ 0x36363636;
        pad[i] = bKey[i] ^ 0x5C5C5C5C;
    }

    let hash = core_sha1(ipad.concat(str2BigEndian(data)), 512 + data.length * 8);
    return !raw
        ? bigEndian2Hex(core_sha1(pad.concat(hash), 512 + 160))
        : bigEndian2Str(core_sha1(pad.concat(hash), 512 + 160));
}

export default sha1;