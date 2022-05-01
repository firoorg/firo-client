const shajs = require('sha.js');
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = require('base-x')(BASE58);

const ADDRESS_PREFIXES = {
    main: {
        pubkeyAddress: 82, // ['a', 'Z'],
        scriptAddress: 7 // ['3', '4']
    },
    test: {
        pubkeyAddress: 65, // ['T'],
        scriptAddress: 178 // ['2']
    },
    regtest: {
        pubkeyAddress: 65, // ['T'],
        scriptAddress: 178 // ['2']
    },
    'regtest-ql': {
        pubkeyAddress: 65, // ['T'],
        scriptAddress: 178 // ['2']
    }
};

// Is address a valid address on the Firo {network} network?
export function isValidAddress(address: string, network: 'test' | 'main' | 'regtest' | 'regtest-ql'): boolean {
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