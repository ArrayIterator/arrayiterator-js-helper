import {strval} from "../Helper";

const hexTab = "0123456789abcdef";
/*
 * Convert an array of big-endian words to a string
 */
export const bigEndian2Str = (bin) => {
    let str = "";
    for (let i = 0; i < bin.length * 32; i += 8) {
        str += String.fromCharCode((bin[i >> 5] >>> (32 - 8 - i % 32)) & 0xFF);
    }
    return str;
}

/*
 * Convert an array of little-endian words to a string
 */
export const littleEndian2Str = (bin) => {
    let str = "";
    for (let i = 0; i < bin.length * 32; i += 8) {
        str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & 0xFF);
    }
    return str;
}
/*
 * Convert an array of big-endian words to a hex string.
 */
export const bigEndian2Hex = (binArray) => {
    let str = "";
    for (let i = 0; i < binArray.length * 4; i++) {
        str += hexTab.charAt((binArray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
            hexTab.charAt((binArray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
    }
    return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
export const littleEndian2Hex = (bin) => {
    let str = "";
    for(let i = 0; i < bin.length * 4; i++) {
        str += hexTab.charAt((bin[i>>2] >> ((i%4)*8+4)) & 0xF) +
            hexTab.charAt((bin[i>>2] >> ((i%4)*8  )) & 0xF);
    }
    return str;
}

/*
 * Convert string to big endian array
 */
export const str2BigEndian = (e) => {
    let bin = new Array(e.length >> 2);
    for (let i = 0; i < e.length * 8; i += 8) {
        bin[i >> 5] |= (e.charCodeAt(i / 8) & 0xFF) << (32 - 8 - i % 32);
    }
    return bin;
};

/*
 * Convert a string to an array of little-endian words
 * If 8 is ASCII, characters >255 have their hi-byte silently ignored.
 */
export const str2LittleEndian = (str) => {
    const bin = [];
    for (let i = 0; i < str.length * 8; i += 8) {
        bin[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return bin;
}

/*
 * Encode a string as utf-16
 */
export const str2LittleEndianUtf16 = (e) => {
    e = strval(e);
    let output = "",
        i;
    for (i = 0; i < e.length; i++) {
        output += String.fromCharCode(
            e.charCodeAt(i) & 0xFF,
            (e.charCodeAt(i) >>> 8) & 0xFF
        );
    }
    return output;
}

export const str2BigEndianUtf16 = (e) => {
    e = strval(e);
    let output = "",
        i;
    for (i = 0; i < e.length; i++) {
        output += String.fromCharCode((e.charCodeAt(i) >>> 8) & 0xFF,
            e.charCodeAt(i) & 0xFF);
    }
    return output;
}


/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
export const safeAdd16 = (x, y) => {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}


/*
 * Bitwise rotate a 32-bit number to the left.
 */
export const rotateLeft = (num, cnt) => (num << cnt) | (num >>> (32 - cnt));
