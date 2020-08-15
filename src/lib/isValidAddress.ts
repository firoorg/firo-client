const shajs = require('sha.js');
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = require('base-x')(BASE58);
const base58Check = require('base58check');

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
    }
};

// Is address a valid address on the Zcoin {network} network?
export function isValidAddress(address: string, network: 'test' | 'main' | 'regtest'): boolean {
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

export function isValidPaymentCode(pc: string): boolean {
    let pcData;
    try {
        pcData = base58Check.decode(pc);
    } catch(e) {
        console.log("cannot decode")
        return false;
    }
    if (pcData.prefix[0] != 0x47) {
        return false;
    }
    let pubkey = pcData.data.slice(2, 35);
    if (pubkey[0] != 2 && pubkey[0] != 3) {
        return false;
    }
    return true;
}