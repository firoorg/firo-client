import fs from 'fs';

export default class CoinSwapHelper {
    static getAllowedCoinSwapPairs() {
        try {
            if (fs.existsSync(CoinSwapHelper.allowedPairsFilePath)) {
                const allowedPairs = JSON.parse(fs.readFileSync(CoinSwapHelper.allowedPairsFilePath));
                if (Array.isArray(allowedPairs)) {
                    return allowedPairs;
                }
            }
            fs.writeFileSync(CoinSwapHelper.allowedPairsFilePath, JSON.stringify(CoinSwapHelper.defaultAllowedPairs));
        } catch (e) {
            console.error(`Error when reading allowed coin swap pair: ${e.message}`);
        }
        return CoinSwapHelper.defaultAllowedPairs;
    }

    static allowedPairsFilePath = 'coin-swap-pairs.json';

    static defaultAllowedPairs = [
        { from: 'XZC', to: 'BTC' },
        { from: 'XZC', to: 'ETH' },
        { from: 'XZC', to: 'ZEC' },
        { from: 'XZC', to: 'LTC' },
        { from: 'XZC', to: 'XRP' },
        { from: 'XZC', to: 'XLM' },
        { from: 'XZC', to: 'BCHABC' },
        { from: 'XZC', to: 'BNB' },
        { from: 'XZC', to: 'USDT' },
        { from: 'XZC', to: 'USDC' },
        { from: 'XZC', to: 'DAI' },
        { from: 'XZC', to: 'DASH' },
        { from: 'XZC', to: 'DCR' },
        { from: 'XZC', to: 'PAX' },
        { from: 'XZC', to: 'TUSD' },
        { from: 'BTC', to: 'XZC' },
        { from: 'ETH', to: 'XZC' },
        { from: 'ZEC', to: 'XZC' },
        { from: 'LTC', to: 'XZC' },
        { from: 'XRP', to: 'XZC' },
        { from: 'XLM', to: 'XZC' },
        { from: 'BCHABC', to: 'XZC' },
        { from: 'BNB', to: 'XZC' },
        { from: 'USDT', to: 'XZC' },
        { from: 'USDC', to: 'XZC' },
        { from: 'DAI', to: 'XZC' },
        { from: 'DASH', to: 'XZC' },
        { from: 'DCR', to: 'XZC' },
        { from: 'PAX', to: 'XZC' },
        { from: 'TUSD', to: 'XZC' }
    ];
}