export function bigintToString(satoshi: bigint, decimals: number=8): string {
    if (typeof satoshi !== 'bigint') return;

    const whole = satoshi / 10n**BigInt(decimals);
    const part = satoshi % 10n**BigInt(decimals);

    if (!part) return `${whole}`;

    const partS = part.toString().substr(0, decimals);
    return `${whole}.${("0".repeat(decimals-partS.length) + partS).match(/^(\d*[1-9])0*$/)[1]}`;
}

export function stringToBigint(coin: string, decimals: number=8): bigint {
    if (typeof coin !== 'string') return;

    const m = coin.match(/^(\d*)\.?(\d*)$/);
    if (!m) return;

    let [_, whole, part] = m;
    part = part.substr(0, decimals);
    if (!whole && !part) return;

    const wholeB = BigInt(whole || 0) * 10n**BigInt(decimals);
    const partB = BigInt(part + "0".repeat(decimals - part.length) || 0)
    return wholeB + partB;
}