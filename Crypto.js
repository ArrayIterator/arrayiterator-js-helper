const Algorithms = {
    AES: {
        description: 'Advanced Encryption Standard',
        ivLength: 16,
        decryptionSupported: true,
        keySupported: true,
        publicKeySupported: false,
        signatureSupported: false,
        default: 'AES-128-CBC',
        algorithms: {
            'AES-128-CBC': {
                name: 'AES-CBC',
                length: 128
            },
            'AES-192-CBC': {
                name: 'AES-CBC',
                length: 192
            },
            'AES-256-CBC': {
                name: 'AES-CBC',
                length: 256
            },
            'AES-128-GCM': {
                name: 'AES-GCM',
                length: 128
            },
            'AES-192-GCM': {
                name: 'AES-GCM',
                length: 192
            },
            'AES-256-GCM': {
                name: 'AES-GCM',
                length: 256
            },
        }
    },
    RSA: {
        description: 'Rivest-Shamir-Adleman',
        ivLength: 0,
        decryptionSupported: true,
        keySupported: true,
        publicKeySupported: true,
        signatureSupported: true,
        default: 'RSA-OAEP',
        algorithms: {
            'RSA-OAEP': {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            'RSA-OAEP-256': {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            'RSA-OAEP-512': {
                name: 'RSA-OAEP',
                hash: 'SHA-512'
            },
            'RSA-PSS': {
                name: 'RSA-PSS',
                hash: 'SHA-256'
            },
            'RSA-PSS-256': {
                name: 'RSA-PSS',
                hash: 'SHA-256'
            },
            'RSA-PSS-512': {
                name: 'RSA-PSS',
                hash: 'SHA-512'
            },
        }
    },
    ECDSA: {
        description: 'Elliptic Curve Digital Signature Algorithm',
        ivLength: 0,
        decryptionSupported: false,
        keySupported: true,
        publicKeySupported: true,
        signatureSupported: true,
        default: 'ECDSA-256',
        algorithms: {
            'ECDSA-256': {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            'ECDSA-384': {
                name: 'ECDSA',
                namedCurve: 'P-384'
            },
            'ECDSA-521': {
                name: 'ECDSA',
                namedCurve: 'P-521'
            },
        }
    },
    HMAC: {
        description: 'Hash-based Message Authentication Code',
        ivLength: 0,
        decryptionSupported: false,
        keySupported: true,
        publicKeySupported: false,
        signatureSupported: true,
        default: 'HMAC-256',
        algorithms: {
            'HMAC-128': {
                name: 'HMAC',
                hash: 'SHA-128'
            },
            'HMAC-256': {
                name: 'HMAC',
                hash: 'SHA-256'
            },
            'HMAC-512': {
                name: 'HMAC',
                hash: 'SHA-512'
            },
        }
    },
    PBKDF2: {
        description: 'Password-Based Key Derivation Function 2',
        ivLength: 0,
        decryptionSupported: false,
        keySupported: true,
        publicKeySupported: false,
        signatureSupported: false,
        default: 'PBKDF2',
        algorithms: {
            'PBKDF2': {
                name: 'PBKDF2',
                hash: 'SHA-256',
                iterations: 10000
            },
            'PBKDF2-256': {
                name: 'PBKDF2',
                hash: 'SHA-256',
                iterations: 10000
            },
            'PBKDF2-512': {
                name: 'PBKDF2',
                hash: 'SHA-512',
                iterations: 10000
            },
        }
    },
    SHA: {
        description: 'Secure Hash Algorithm',
        ivLength: 0,
        decryptionSupported: false,
        keySupported: false,
        publicKeySupported: false,
        signatureSupported: false,
        default: 'SHA-256',
        algorithms: {
            'SHA-256': {
                name: 'SHA-256'
            },
            'SHA-384': {
                name: 'SHA-384'
            },
            'SHA-512': {
                name: 'SHA-512'
            },
        }
    },
}
const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}
const AvailableAlgorithms = [];
for (const algo in Algorithms) {
    for (const key in Algorithms[algo].algorithms) {
        AvailableAlgorithms.push(key);
    }
}
const GetAlgorithm = (algorithm) => {
    if (typeof algorithm !== 'string') {
        return null;
    }
    algorithm = algorithm.trim().toUpperCase();
    if (!AvailableAlgorithms.includes(algorithm)) {
        return null;
    }
    for (const algo in Algorithms) {
        if (Algorithms[algo].algorithms.hasOwnProperty(algorithm)) {
            return {
                group: algo,
                decryptionSupported: Algorithms[algo].decryptionSupported,
                keySupported: Algorithms[algo].keySupported,
                publicKeySupported: Algorithms[algo].publicKeySupported,
                description: Algorithms[algo].description,
                ivLength: Algorithms[algo].ivLength,
                algo: Algorithms[algo].algorithms[algorithm]
            };
        }
    }
    return null;
}

class Crypto {
    #algorithm = null;
    #options = {
        group: null,
        decryptionSupported: false,
        keySupported: false,
        publicKeySupported: false,
        signatureSupported: false,
        ivLength: 0,
        key: null,
        publicKey: null,
        iv: null,
        cipher: null,
        decipher: null,
        signature: null,
    };
    #encryptedData = null;

    constructor(algorithm = 'AES-128-CBC') {
        if (new.target === undefined) {
            return new Crypto(algorithm);
        }
        if (typeof algorithm !== 'string') {
            throw new TypeError('Invalid algorithm');
        }
        algorithm = algorithm.trim().toUpperCase();
        if (Algorithms[algorithm]) {
            algorithm = Algorithms[algorithm].default;
        }
        algorithm = algorithm.replace(/[^A-Z0-9-]/g, '');
        const ObjectAlgo = GetAlgorithm(algorithm);
        if (!ObjectAlgo) {
            throw new TypeError(
                `Unsupported algorithm: ${algorithm}`
            );
        }
        this.#options.signatureSupported = ObjectAlgo.signatureSupported;
        this.#options.publicKeySupported = ObjectAlgo.publicKeySupported;
        this.#options.group = ObjectAlgo.group;
        this.#options.keySupported = ObjectAlgo.keySupported;
        this.#options.decryptionSupported = ObjectAlgo.decryptionSupported;
        this.#options.ivLength = ObjectAlgo.ivLength || 0;
        this.#algorithm = ObjectAlgo.algo;
    }

    static availableAlgorithms() {
        return AvailableAlgorithms;
    }

    isSupportedIVLength() {
        return this.ivLength > 0;
    }

    isDecryptionSupported() {
        return this.#options.decryptionSupported;
    }

    isKeySupported() {
        return this.#options.keySupported;
    }

    isPublicKeySupported() {
        return this.#options.publicKeySupported;
    }
    isSupportSignature() {
        return this.#options.signatureSupported;
    }
    get ivLength() {
        return this.#options.ivLength;
    }

    get iv() {
        return this.#options.iv;
    }

    get key() {
        return this.#options.key;
    }

    get group() {
        return this.#options.group;
    }

    get publicKey() {
        return this.#options.publicKey;
    }
    get signature() {
        return this.#options.signature;
    }
    get encryptedData() {
        return this.#encryptedData;
    }

    get encryptedDataHex() {
        if (!this.encryptedData) {
            return null;
        }
        // noinspection JSCheckFunctionSignatures
        return [...new Uint8Array(this.encryptedData)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }

    get encryptedDataBase64() {
        if (!this.encryptedData) {
            return null;
        }
        return btoa(this.encryptedDataRawBinary);
    }

    get encryptedDataRawBinary() {
        if (!this.encryptedData) {
            return null;
        }
        return String.fromCharCode(...new Uint8Array(this.encryptedData));
    }

    setKey(key) {
        if (!this.isKeySupported() || this.group === 'SHA') {
            return Promise.resolve(this);
        }
        if (typeof key === 'object' && key.hasOwnProperty('secretKey')) {
            key = key.secretKey;
        }
        if (key instanceof CryptoKey) {
            this.#options.key = key;
            return Promise.resolve(this);
        }
        if (typeof key === 'string') {
            key = new TextEncoder().encode(key);
        }
        if (key instanceof Uint8Array) {
            key = key.buffer;
        }
        if (key instanceof ArrayBuffer) {
            return new Promise((resolve, reject) => {
                crypto.subtle.importKey(
                    'raw',
                    key,
                    this.#algorithm,
                    true,
                    ["encrypt", "decrypt"]
                ).then((key) => {
                    this.#options.key = key;
                    resolve(this);
                }).catch(reject);
            });
        }
        throw new TypeError('Invalid key');
    }

    setPublicKey(key) {
        if (!this.isPublicKeySupported()) {
            return Promise.resolve(this);
        }
        if (this.group !== 'RSA') {
            throw new TypeError('Public key is not supported');
        }
        if (typeof key === 'object' && key.hasOwnProperty('publicKey')) {
            key = key.publicKey;
        }
        if (key instanceof CryptoKey) {
            this.#options.publicKey = key;
            return Promise.resolve(this);
        }
        if (typeof key === 'string') {
            key = new TextEncoder().encode(key);
        }
        if (key instanceof Uint8Array) {
            key = key.buffer;
        }
        if (key instanceof ArrayBuffer) {
            return new Promise((resolve, reject) => {
                crypto.subtle.importKey(
                    'spki',
                    key,
                    this.#algorithm,
                    true,
                    ["encrypt"]
                ).then((key) => {
                    this.#options.publicKey = key;
                    resolve(this);
                }).catch(reject);
            });
        }
        throw new TypeError('Invalid public key');
    }
    setSignature(signature) {
        if (!this.isSupportSignature()) {
            return this;
        }
        if (typeof signature === 'object' && signature.hasOwnProperty('signature')) {
            signature = signature.signature;
        }
        if (signature instanceof CryptoKey) {
            this.#options.signature = signature;
            return this;
        }
        if (typeof signature === 'string') {
            signature = new TextEncoder().encode(signature);
        }
        if (signature instanceof Uint8Array) {
            signature = signature.buffer;
        }
        if (signature instanceof ArrayBuffer) {
            return new Promise((resolve, reject) => {
                crypto.subtle.importKey(
                    'raw',
                    signature,
                    this.#algorithm,
                    true,
                    ["verify"]
                ).then((key) => {
                    this.#options.signature = key;
                    resolve(this);
                }).catch(reject);
            });
        }
        throw new TypeError('Invalid signature');
    }
    setIV(iv) {
        if (!this.isSupportedIVLength()) {
            return this;
        }
        if (iv.length !== this.ivLength) {
            throw new TypeError(
                `Invalid IV length: ${iv.length} (expected: ${this.ivLength})`
            );
        }
        this.#options.iv = iv;
        return this;
    }

    generateKey() {
        if (!this.isKeySupported()) {
            return Promise.reject('Key is not supported');
        }
        return new Promise((resolve, reject) => {
            crypto.subtle.generateKey(
                this.#algorithm,
                true,
                ["encrypt", "decrypt"]
            ).then((key) => {
                resolve(key);
            }).catch(reject);
        });
    }

    encrypt(data) {
        const supportedKey = this.isKeySupported();
        return new Promise(async (resolve, reject) => {
            if (this.group === 'SHA') {
                switch (this.#algorithm.name) {
                    case 'SHA-256':
                    case 'SHA-384':
                    case 'SHA-512':
                        this.#encryptedData = await crypto.subtle.digest(
                            this.#algorithm,
                            new TextEncoder().encode(data)
                        );
                        resolve(this);
                        return;
                }
                reject(new TypeError('Unsupported algorithm'));
            }

            let key = this.key;
            if (!key) {
                if (this.group === 'HMAC') {
                    reject(new TypeError('Key is required'));
                    return;
                }
                const generatedKey = await this.generateKey();
                await this.setKey(generatedKey);
                key = this.key;
                if (this.isPublicKeySupported()) {
                    await this.setPublicKey(generatedKey);
                }
            }
            if (this.group === 'HMAC' || this.group === 'ECDSA') {
                this.#encryptedData = await crypto.subtle.sign(
                    this.#algorithm,
                    key,
                    new TextEncoder().encode(data)
                );
                resolve(this);
                return;
            }
            if (this.isSupportedIVLength()) {
                if (!this.iv) {
                    await this.setIV(crypto.getRandomValues(new Uint8Array(this.ivLength)));
                }
            }
            if (this.group === 'PBKDF2') {
                const salt = this.iv;
                const iterations = this.#algorithm.iterations;
                const hash = this.#algorithm.hash;
                this.#encryptedData = await crypto.subtle.importKey(
                    'raw',
                    new TextEncoder().encode(data),
                    {
                        name: 'PBKDF2'
                    },
                    false,
                    ['deriveBits']
                ).then((key) => {
                    return crypto.subtle.deriveBits(
                        {
                            name: 'PBKDF2',
                            salt: salt,
                            iterations: iterations,
                            hash: hash
                        },
                        key,
                        256
                    );
                });
                resolve(this);
                return;
            }
            if (this.group === 'AES') {
                crypto.subtle.encrypt(
                    {
                        name: this.#algorithm.name,
                        iv: this.iv
                    },
                    key,
                    new TextEncoder().encode(data)
                ).then((cipher) => {
                    this.#encryptedData = cipher;
                    resolve(this);
                }).catch(reject);
                return;
            }
            if (this.group === 'RSA') {
                if (!this.publicKey) {
                    // generate public key from secret key
                    this.#options.publicKey = await crypto.subtle.exportKey(
                        'spki',
                        key
                    );
                }
                crypto.subtle.encrypt(
                    {
                        name: this.#algorithm.name
                    },
                    this.publicKey,
                    new TextEncoder().encode(data)
                ).then((cipher) => {
                    this.#encryptedData = cipher;
                    resolve(this);
                }).catch(reject);
                return;
            }
            reject(new TypeError(`Unsupported algorithm: ${this.group}`));
        });
    }
    verify(data) {
        if (!this.isSupportSignature()) {
            return Promise.reject('Signature is not supported');
        }
        const key = this.key;
        if (!key) {
            return Promise.reject('Key is required');
        }
        return new Promise(async (resolve, reject) => {
            if (this.group === 'HMAC' || this.group === 'ECDSA') {
                const signature = this.signature;
                if (!signature) {
                    reject(new TypeError('Signature is required'));
                    return;
                }
                resolve(await crypto.subtle.verify(
                    this.#algorithm,
                    key,
                    signature,
                    new TextEncoder().encode(data)
                ));
                return;
            }
            if (this.group === 'RSA') {
                if (!this.publicKey) {
                    reject(new TypeError('Public key is required'));
                    return;
                }
                resolve(await crypto.subtle.verify(
                    this.#algorithm,
                    this.publicKey,
                    this.signature,
                    new TextEncoder().encode(data)
                ));
                return;
            }
            reject(new TypeError(`Unsupported algorithm: ${this.group}`));
        });
    }
    decrypt(data) {
        if (!this.isDecryptionSupported()) {
            return Promise.reject('Decryption is not supported');
        }
        return new Promise(async (resolve, reject) => {
            if (this.group === 'SHA' || this.group === 'HMAC' || this.group === 'ECDSA' || this.group === 'PBKDF2') {
                reject(new TypeError('Decryption is not supported'));
                return;
            }
            let key = this.key;
            if (!key) {
                reject(new TypeError('Key is required'));
                return;
            }
            if (this.group === 'AES') {
                crypto.subtle.decrypt(
                    {
                        name: this.#algorithm.name,
                        iv: this.iv
                    },
                    key,
                    data
                ).then((decipher) => {
                    this.#encryptedData = decipher;
                    resolve(this);
                }).catch(reject);
                return;
            }
            if (this.group === 'RSA') {
                if (!this.publicKey) {
                    reject(new TypeError('Public key is required'));
                    return;
                }
                crypto.subtle.decrypt(
                    {
                        name: this.#algorithm.name
                    },
                    key,
                    data
                ).then((decipher) => {
                    this.#encryptedData = decipher;
                    resolve(this);
                }).catch(reject);
                return;
            }
            reject(new TypeError(`Unsupported algorithm: ${this.group}`));
        });
    }
    static getAlgorithms() {
        return clone(Algorithms);
    }
    static getAvailableAlgorithms() {
        return clone(AvailableAlgorithms);
    }
}

export default Crypto;
