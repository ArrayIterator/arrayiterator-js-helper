/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined
 * in FIPS 180-2
 * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
import {bigEndian2Hex, bigEndian2Str, str2BigEndian} from "./EndianUtil.js";
import {strval, utf8_encode} from "../Helper";

/*
 * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
 */
let sha512_dwords;

//A constructor for 64-bit numbers
function Int64(h, l) {
    this.h = h;
    this.l = l;
    //this.toString = int64toString;
}

//Copies src into dst, assuming both are 64-bit numbers
function int64copy(dst, src) {
    dst.h = src.h;
    dst.l = src.l;
}

//Right-rotates a 64-bit number by shift
//Won't handle cases of shift>=32
//The function revrrot() is for that
function int64rrot(dst, x, shift) {
    dst.l = (x.l >>> shift) | (x.h << (32 - shift));
    dst.h = (x.h >>> shift) | (x.l << (32 - shift));
}

//Reverses the dwords of the source and then rotates right by shift.
//This is equivalent to rotation by 32+shift
function int64revrrot(dst, x, shift) {
    dst.l = (x.h >>> shift) | (x.l << (32 - shift));
    dst.h = (x.l >>> shift) | (x.h << (32 - shift));
}

//Bitwise-shifts right a 64-bit number by shift
//Won't handle shift>=32, but it's never needed in SHA512
function int64shr(dst, x, shift) {
    dst.l = (x.l >>> shift) | (x.h << (32 - shift));
    dst.h = (x.h >>> shift);
}

//Adds two 64-bit numbers
//Like the original implementation, does not rely on 32-bit operations
function int64add(dst, x, y) {
    const w0 = (x.l & 0xffff) + (y.l & 0xffff);
    const w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
    const w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
    const w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}

//Same, except with 4 addends. Works faster than adding them one by one.
function int64add4(dst, a, b, c, d) {
    const w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
    const w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
    const w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
    const w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}

//Same, except with 5 addends
function int64add5(dst, a, b, c, d, e) {
    const w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff);
    const w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16);
    const w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16);
    const w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}
function core_sha512(x, len) {
    if (!sha512_dwords) {
        //SHA512 constants
        sha512_dwords = [
            new Int64(0x428a2f98, -685199838), new Int64(0x71374491, 0x23ef65cd),
            new Int64(-1245643825, -330482897), new Int64(-373957723, -2121671748),
            new Int64(0x3956c25b, -213338824), new Int64(0x59f111f1, -1241133031),
            new Int64(-1841331548, -1357295717), new Int64(-1424204075, -630357736),
            new Int64(-670586216, -1560083902), new Int64(0x12835b01, 0x45706fbe),
            new Int64(0x243185be, 0x4ee4b28c), new Int64(0x550c7dc3, -704662302),
            new Int64(0x72be5d74, -226784913), new Int64(-2132889090, 0x3b1696b1),
            new Int64(-1680079193, 0x25c71235), new Int64(-1046744716, -815192428),
            new Int64(-459576895, -1628353838), new Int64(-272742522, 0x384f25e3),
            new Int64(0xfc19dc6, -1953704523), new Int64(0x240ca1cc, 0x77ac9c65),
            new Int64(0x2de92c6f, 0x592b0275), new Int64(0x4a7484aa, 0x6ea6e483),
            new Int64(0x5cb0a9dc, -1119749164), new Int64(0x76f988da, -2096016459),
            new Int64(-1740746414, -295247957), new Int64(-1473132947, 0x2db43210),
            new Int64(-1341970488, -1728372417), new Int64(-1084653625, -1091629340),
            new Int64(-958395405, 0x3da88fc2), new Int64(-710438585, -1828018395),
            new Int64(0x6ca6351, -536640913), new Int64(0x14292967, 0xa0e6e70),
            new Int64(0x27b70a85, 0x46d22ffc), new Int64(0x2e1b2138, 0x5c26c926),
            new Int64(0x4d2c6dfc, 0x5ac42aed), new Int64(0x53380d13, -1651133473),
            new Int64(0x650a7354, -1951439906), new Int64(0x766a0abb, 0x3c77b2a8),
            new Int64(-2117940946, 0x47edaee6), new Int64(-1838011259, 0x1482353b),
            new Int64(-1564481375, 0x4cf10364), new Int64(-1474664885, -1136513023),
            new Int64(-1035236496, -789014639), new Int64(-949202525, 0x654be30),
            new Int64(-778901479, -688958952), new Int64(-694614492, 0x5565a910),
            new Int64(-200395387, 0x5771202a), new Int64(0x106aa070, 0x32bbd1b8),
            new Int64(0x19a4c116, -1194143544), new Int64(0x1e376c08, 0x5141ab53),
            new Int64(0x2748774c, -544281703), new Int64(0x34b0bcb5, -509917016),
            new Int64(0x391c0cb3, -976659869), new Int64(0x4ed8aa4a, -482243893),
            new Int64(0x5b9cca4f, 0x7763e373), new Int64(0x682e6ff3, -692930397),
            new Int64(0x748f82ee, 0x5defb2fc), new Int64(0x78a5636f, 0x43172f60),
            new Int64(-2067236844, -1578062990), new Int64(-1933114872, 0x1a6439ec),
            new Int64(-1866530822, 0x23631e28), new Int64(-1538233109, -561857047),
            new Int64(-1090935817, -1295615723), new Int64(-965641998, -479046869),
            new Int64(-903397682, -366583396), new Int64(-779700025, 0x21c0c207),
            new Int64(-354779690, -840897762), new Int64(-176337025, -294727304),
            new Int64(0x6f067aa, 0x72176fba), new Int64(0xa637dc5, -1563912026),
            new Int64(0x113f9804, -1090974290), new Int64(0x1b710b35, 0x131c471b),
            new Int64(0x28db77f5, 0x23047d84), new Int64(0x32caab7b, 0x40c72493),
            new Int64(0x3c9ebe0a, 0x15c9bebc), new Int64(0x431d67c4, -1676669620),
            new Int64(0x4cc5d4be, -885112138), new Int64(0x597f299c, -60457430),
            new Int64(0x5fcb6fab, 0x3ad6faec), new Int64(0x6c44198c, 0x4a475817)];
    }

    //Initial hash values
    const H = [
        new Int64(0x6a09e667, -205731576),
        new Int64(-1150833019, -2067093701),
        new Int64(0x3c6ef372, -23791573),
        new Int64(-1521486534, 0x5f1d36f1),
        new Int64(0x510e527f, -1377402159),
        new Int64(-1694144372, 0x2b3e6c1f),
        new Int64(0x1f83d9ab, -79577749),
        new Int64(0x5be0cd19, 0x137e2179)
    ];

    const T1 = new Int64(0, 0),
        T2 = new Int64(0, 0),
        a = new Int64(0, 0),
        b = new Int64(0, 0),
        c = new Int64(0, 0),
        d = new Int64(0, 0),
        e = new Int64(0, 0),
        f = new Int64(0, 0),
        g = new Int64(0, 0),
        h = new Int64(0, 0),
        //Temporary variables not specified by the document
        s0 = new Int64(0, 0),
        s1 = new Int64(0, 0),
        Ch = new Int64(0, 0),
        Maj = new Int64(0, 0),
        r1 = new Int64(0, 0),
        r2 = new Int64(0, 0),
        r3 = new Int64(0, 0);
    let j, i;
    const W = new Array(80);
    for (i = 0; i < 80; i++) {
        W[i] = new Int64(0, 0);
    }
    // append padding to the source string. The format is described in the FIPS.
    x[len >> 5] |= 0x80 << (24 - (len & 0x1f));
    x[((len + 128 >> 10) << 5) + 31] = len;

    //32 dwords is the block size
    for (i = 0; i < x.length; i += 32) {
        int64copy(a, H[0]);
        int64copy(b, H[1]);
        int64copy(c, H[2]);
        int64copy(d, H[3]);
        int64copy(e, H[4]);
        int64copy(f, H[5]);
        int64copy(g, H[6]);
        int64copy(h, H[7]);

        for (j = 0; j < 16; j++) {
            W[j].h = x[i + 2 * j];
            W[j].l = x[i + 2 * j + 1];
        }

        for (j = 16; j < 80; j++) {
            //sigma1
            int64rrot(r1, W[j - 2], 19);
            int64revrrot(r2, W[j - 2], 29);
            int64shr(r3, W[j - 2], 6);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;
            //sigma0
            int64rrot(r1, W[j - 15], 1);
            int64rrot(r2, W[j - 15], 8);
            int64shr(r3, W[j - 15], 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
        }

        for (j = 0; j < 80; j++) {
            //Ch
            Ch.l = (e.l & f.l) ^ (~e.l & g.l);
            Ch.h = (e.h & f.h) ^ (~e.h & g.h);

            //Sigma1
            int64rrot(r1, e, 14);
            int64rrot(r2, e, 18);
            int64revrrot(r3, e, 9);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;

            //Sigma0
            int64rrot(r1, a, 28);
            int64revrrot(r2, a, 2);
            int64revrrot(r3, a, 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            //Maj
            Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
            Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);

            int64add5(T1, h, s1, Ch, sha512_dwords[j], W[j]);
            int64add(T2, s0, Maj);

            int64copy(h, g);
            int64copy(g, f);
            int64copy(f, e);
            int64add(e, d, T1);
            int64copy(d, c);
            int64copy(c, b);
            int64copy(b, a);
            int64add(a, T1, T2);
        }
        int64add(H[0], H[0], a);
        int64add(H[1], H[1], b);
        int64add(H[2], H[2], c);
        int64add(H[3], H[3], d);
        int64add(H[4], H[4], e);
        int64add(H[5], H[5], f);
        int64add(H[6], H[6], g);
        int64add(H[7], H[7], h);
    }

    //represent the hash as an array of 32-bit dwords
    const hash = new Array(16);
    for (i = 0; i < 8; i++) {
        hash[2 * i] = H[i].h;
        hash[2 * i + 1] = H[i].l;
    }
    return hash;
}

export const sha512 = (str, raw = false) => {
    str = typeof str === 'boolean' ? (str ? '1' : '0') : strval(str);
    return !raw
        ? bigEndian2Hex(core_sha512(str2BigEndian(str), str.length * 8))
        : bigEndian2Str(core_sha512(str2BigEndian(str), str.length * 8));
}

export const hmac_sha512 = (data, key, raw = false) => {
    data = typeof data === 'boolean' ? (data ? '1' : '0') : strval(data);
    data = utf8_encode(data);
    let bKey = str2BigEndian(key),
        i;
    if (bKey.length > 32) {
        bKey = core_sha512(bKey, key.length * 8);
    }

    let ipad = Array(32), pad = Array(32);
    for (i = 0; i < 32; i++) {
        ipad[i] = bKey[i] ^ 0x36363636;
        pad[i] = bKey[i] ^ 0x5C5C5C5C;
    }

    const hash = core_sha512(ipad.concat(str2BigEndian(data)), 1024 + data.length * 8);
    return !raw
        ? bigEndian2Hex(core_sha512(pad.concat(hash), 1024 + 512))
        : bigEndian2Str(core_sha512(pad.concat(hash), 1024 + 512));
}

export default sha512;
