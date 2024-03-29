type Network = 'test' | 'main' | 'regtest' | 'regtest-ql';

const shajs = require('sha.js');
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = require('base-x')(BASE58);
const bech32 = require('bech32-buffer');

const ADDRESS_PREFIXES: Record<Network, {pubkeyAddress: number, scriptAddress: number, exchangeAddress: number[]}> = {
    main: {
        pubkeyAddress: 82, // ['a', 'Z'],
        scriptAddress: 7, // ['3', '4']
        exchangeAddress: [1, 185, 187]
    },
    test: {
        pubkeyAddress: 65, // ['T'],
        scriptAddress: 178, // ['2']
        exchangeAddress: [1, 185, 177]
    },
    regtest: {
        pubkeyAddress: 65,  // ['T'],
        scriptAddress: 178, // ['2']
        exchangeAddress: [1, 185, 172]
    },
    'regtest-ql': {
        pubkeyAddress: 65, // ['T'],
        scriptAddress: 178, // ['2']
        exchangeAddress: [1, 185, 172]
    }
};

export function isValidAddress(address: string, network: Network): boolean {
    return isValidExchangeAddress(address, network) || isValidLegacyAddress(address, network) ||
        isValidSparkAddress(address, network);
}

export function isValidSparkAddress(address: string, network: Network): boolean {
    if (address.length != 144)
        return false;

    let addressData;

    try {
        addressData = bech32.decode(address);
    } catch (e) {
        return false;
    }

    if (addressData.encoding != 'bech32m')
        return false;

    if (addressData.prefix[0] != 's')
        return false;

    if (network == 'main') {
        if (addressData.prefix[1] != 'm')
            return false;
    } else if (network == 'test') {
        if (addressData.prefix[1] != 't')
            return false;
    } else if (network == 'regtest' || network == 'regtest-ql') {
        if (addressData.prefix[1] != 'r')
            return false;
    } else if (network == 'devnet') {
        if (addressData.prefix[1] != 'd')
            return false;
    } else {
        return false;
    }

    return true;
}

// Is address a valid address on the Firo {network} network?
export function isValidLegacyAddress(address: string, network: 'test' | 'main' | 'regtest' | 'regtest-ql'): boolean {
    let addressData;

    try {
        addressData = bs58.decode(address);
    } catch(e) {
        return false;
    }

    // A length of less than 5 would provide insufficient space for content and a checksum.
    if (addressData.length < 5) {
        return false;
    }

    // Make sure the address is from the correct network.
    if (addressData[0] !== ADDRESS_PREFIXES[network].pubkeyAddress && addressData[0] !== ADDRESS_PREFIXES[network].scriptAddress) {
        return false;
    }

    const contentData = addressData.slice(0, -4);
    const checksum = addressData.slice(-4);
    // calculatedChecksum is the first four bytes of the sha256^2 of contentData
    const calculatedChecksum = shajs('sha256')
        .update(
            shajs('sha256')
            .update(contentData)
            .digest()
        )
        .digest()
        .slice(0, 4);

    return [0, 1, 2, 3].every((i) => checksum[i] === calculatedChecksum[i]);
}

// Is address a valid exchamge address on the Firo {network} network?
export function isValidExchangeAddress(address: string, network: 'test' | 'main' | 'regtest' | 'regtest-ql'): boolean {
    let addressData;

    try {
        addressData = bs58.decode(address);
    } catch(e) {
        return false;
    }

    // A length of less than 5 would provide insufficient space for content and a checksum.
    if (addressData.length < 5) {
        return false;
    }

    // Make sure the address is from the correct network.
    for (let i = 0; i < ADDRESS_PREFIXES[network].exchangeAddress.length; i++) {
        if (addressData[i] != ADDRESS_PREFIXES[network].exchangeAddress[i])
            return false;
    }

    const contentData = addressData.slice(0, -4);
    const checksum = addressData.slice(-4);
    // calculatedChecksum is the first four bytes of the sha256^2 of contentData
    const calculatedChecksum = shajs('sha256')
        .update(
            shajs('sha256')
            .update(contentData)
            .digest()
        )
        .digest()
        .slice(0, 4);

    return [0, 1, 2, 3].every((i) => checksum[i] === calculatedChecksum[i]);
}

export function isValidPaymentCode(address: string, network: 'test' | 'main' | 'regtest'): boolean {
    // Payment codes do not have a network identifier.

    let paymentCodeData;

    try {
        paymentCodeData = bs58.decode(address);
    } catch(e) {
        return false;
    }

    const contentData = paymentCodeData.slice(0, -4);
    const checksum = paymentCodeData.slice(-4);
    // calculatedChecksum is the first four bytes of the sha256^2 of contentData
    const calculatedChecksum = shajs('sha256')
        .update(
            shajs('sha256')
                .update(contentData)
                .digest()
        )
        .digest()
        .slice(0, 4);
    if (![0, 1, 2, 3].every((i) => checksum[i] === calculatedChecksum[i])) return false;

    if (contentData.length != 81) return false;
    if (contentData[0] != 71) return false;
    if (![2, 3, 4, 6, 7].includes(contentData[3])) return false;

    let foundNonZero = false;
    for (let i = 36; i++; i < 68) {
        if (contentData[i] != 0) {
            foundNonZero = true;
            break;
        }
    }
    if (!foundNonZero) return false;

    return true;
}