import Big from 'big.js';

export function convertToCoin(satoshi: number): string {
    return Big(satoshi).div(1e8).toString();
}

export function convertToSatoshi(coin: string): number {
    if (typeof coin !== 'string' || !coin || !coin.match(/^\d*\.?\d*$/)) return NaN;
    return Number(Big(coin).mul(1e8));
}