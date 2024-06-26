/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Also http://anmar.eu.org/projects/jssha2/
 */

import {
    bigEndian2Hex,
    bigEndian2Str,
    safeAdd16,
    str2BigEndian
} from "./EndianUtil.js";
import {strval, utf8_encode} from "../Helper";


/*
 * Main sha256 function, with its support functions
 */
function sha256_S(X, n) {
    return (X >>> n) | (X << (32 - n));
}

function sha256_R(X, n) {
    return (X >>> n);
}

function sha256_Ch(x, y, z) {
    return ((x & y) ^ ((~x) & z));
}

function sha256_Maj(x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z));
}

function sha256_Sigma0256(x) {
    return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
}

function sha256_Sigma1256(x) {
    return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
}

function sha256_Gamma0256(x) {
    return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
}

function sha256_Gamma1256(x) {
    return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
}


const sha256_K = [
    1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
    -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
    1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
    -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
    -1866530822, -1538233109, -1090935817, -965641998
];

function core_sha256(m, l) {
    const HASH = [
        1779033703, -1150833019, 1013904242, -1521486534,
        1359893119, -1694144372, 528734635, 1541459225
    ];
    const W = new Array(64);
    let a, b, c, d, e, f, g, h;
    let i, j, T1, T2;

    /* append padding */
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;

    for (i = 0; i < m.length; i += 16) {
        a = HASH[0];
        b = HASH[1];
        c = HASH[2];
        d = HASH[3];
        e = HASH[4];
        f = HASH[5];
        g = HASH[6];
        h = HASH[7];

        for (j = 0; j < 64; j++) {
            if (j < 16) {
                W[j] = m[j + i];
            } else {
                W[j] = safeAdd16(safeAdd16(safeAdd16(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                    sha256_Gamma0256(W[j - 15])), W[j - 16]);
            }

            T1 = safeAdd16(safeAdd16(safeAdd16(safeAdd16(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
                sha256_K[j]), W[j]);
            T2 = safeAdd16(sha256_Sigma0256(a), sha256_Maj(a, b, c));
            h = g;
            g = f;
            f = e;
            e = safeAdd16(d, T1);
            d = c;
            c = b;
            b = a;
            a = safeAdd16(T1, T2);
        }

        HASH[0] = safeAdd16(a, HASH[0]);
        HASH[1] = safeAdd16(b, HASH[1]);
        HASH[2] = safeAdd16(c, HASH[2]);
        HASH[3] = safeAdd16(d, HASH[3]);
        HASH[4] = safeAdd16(e, HASH[4]);
        HASH[5] = safeAdd16(f, HASH[5]);
        HASH[6] = safeAdd16(g, HASH[6]);
        HASH[7] = safeAdd16(h, HASH[7]);
    }
    return HASH;
}

export const sha256 = (str, raw = false) => {
    str = typeof str === 'boolean' ? (str ? '1' : '0') : strval(str);
    return !raw
        ? bigEndian2Hex(core_sha256(str2BigEndian(str), str.length * 8))
        : bigEndian2Str(core_sha256(str2BigEndian(str), str.length * 8));
}

export const hmac_sha256 = (data, key, raw = false) => {
    data = typeof data === 'boolean' ? (data ? '1' : '0') : strval(data);
    data = utf8_encode(data);
    let bKey = str2BigEndian(key),
        i;
    if (bKey.length > 16) {
        bKey = core_sha256(bKey, key.length * 8);
    }

    const ipad = Array(16), pad = Array(16);
    for (i = 0; i < 16; i++) {
        ipad[i] = bKey[i] ^ 0x36363636;
        pad[i] = bKey[i] ^ 0x5C5C5C5C;
    }

    const hash = core_sha256(ipad.concat(str2BigEndian(data)), 512 + data.length * 8);
    return !raw
        ? bigEndian2Hex(core_sha256(pad.concat(hash), 512 + 256))
        : bigEndian2Str(core_sha256(pad.concat(hash), 512 + 256));
}

export default sha256;
