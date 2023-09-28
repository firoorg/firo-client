import axios from 'axios';
import {bigintToString, stringToBigint} from './convert';

export const PROVIDERS: Provider[] = ['ChangeNow', 'Exolix'];
export type Provider = 'ChangeNow' | 'StealthEx' | 'SwapZone' | 'Exolix';
export type OrderStatus = 'waiting' | 'expired' | 'received' | 'confirming' | 'exchanging' | 'confirmed' | 'confirmation' | 'finished' | 'refunded' | 'failed';
export type Ticker = string;
export type QuoteId = string | null;
export type OrderId = string;
export type Address = string;
export type ApiKey = string;
export type Timestamp = number; // seconds past the epoch
export type TransactionId = string;

export interface PairInfo {
    provider: Provider;
    quoteId: QuoteId;
    from: Ticker;
    to: Ticker;
    rate: bigint; // ${rate} ${from} = 1e8 ${to}
    min: bigint;
    max: bigint;
    fee: bigint;
}

export interface Order {
    sendAmount: bigint;
    refundAddress: Address;
    destinationAddress: Address,
    pairInfo: PairInfo;
}

export interface OrderInfo {
    provider: Provider;

    sendAmount: bigint;
    refundAddress: Address;
    destinationAddress: Address;

    from: Ticker;
    to: Ticker;
    rate?: bigint;
    fee: bigint;

    orderId: OrderId;
    exchangeAddress: Address;
    status: OrderStatus;
    receiveAmount: bigint;

    fromTxId?: TransactionId;
    toTxId?: TransactionId;
    refundTxId?: TransactionId;

    createdAt?: Timestamp;
    receivedAt?: Timestamp;
    updatedAt?: Timestamp;
    validUntil?: Timestamp;
}

export class CoinSwapError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CoinSwapError';
    }
}

export class UnavailablePairError extends CoinSwapError {
    constructor(from: Ticker, to: Ticker) {
        super(`Pair ${from} -> ${to} is not available`);
        this.name = 'UnavailablePairError';
    }
}

export abstract class AbstractCoinSwapApi {
    provider: Provider;
    apiKey: ApiKey;
    refreshInterval: number = 60e3 * 3;

    abstract getPairs(): Promise<[Ticker, Ticker][]>;
    abstract getPairInfo(from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo>;
    abstract getOrderStatus(orderId: OrderId): Promise<OrderInfo>;
    abstract makeOrder(order: Order): Promise<OrderInfo>;
}

export class ChangeNowApi extends AbstractCoinSwapApi {
    API: string = 'https://api.changenow.io/v1';
    provider: Provider = 'ChangeNow';
    marketInfo: PairInfo[];
    fetchTime: number;

    constructor(apiKey: ApiKey) {
        super();
        this.apiKey = apiKey;
        this.fetchTime = 0;
        this.marketInfo = null;
    }

    async getPairs(): Promise<[Ticker, Ticker][]> {
        await this.fetchMarketInfoIfOutdated();

        return this.marketInfo.map(info => [info.from, info.to]);
    }

    async getPairInfo(from: string, to: string, amount: bigint): Promise<PairInfo> {
        await this.fetchMarketInfoIfOutdated();

        const pairInfo = this.marketInfo.find(info => info.from == from && info.to == to);
        if (!pairInfo)
            throw new UnavailablePairError(from, to);

        return pairInfo;
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderInfo> {
        const response = await axios.get(
            `${this.API}/transactions/${orderId}/${this.apiKey}`,
            {headers: {'Content-Type': 'application/json'}}
        );

        let rate;
        if (response.data.expectedReceiveAmount && response.data.sendAmount)
            rate =
                (stringToBigint(String(response.data.expectedReceiveAmount)) * 10n**8n) /
                stringToBigint(String(response.data.sendAmount));

        const validUntil = response.data.validUntil && Math.floor(Date.parse(response.data.validUntil) / 1000);

        return {
            provider: this.provider,

            sendAmount: stringToBigint(String(response.data.amountSend)),
            refundAddress: response.data.receiveAddress,
            destinationAddress: response.data.payoutAddress,

            from: response.data.fromCurrency.toUpperCase(),
            to: response.data.toCurrency.toUpperCase(),
            rate,
            fee: stringToBigint(response.data.minerFee),

            orderId: response.data.id,
            exchangeAddress: response.data.payinAddress,
            status: response.data.status,
            receiveAmount: stringToBigint(String(response.data.amountReceive)) || undefined,

            fromTxId: response.data.payinHash || undefined,
            toTxId: response.data.payoutHash || undefined,
            refundTxId: response.data.refundHash || undefined,

            createdAt: Math.floor(Date.parse(response.data.createdAt) / 1000),
            receivedAt: response.data.depositReceivedAt && Math.floor(Date.parse(response.data.depositReceivedAt) / 1000),
            updatedAt: response.data.updatedAt && Math.floor(Date.parse(response.data.updatedAt) / 1000),
            validUntil
        };
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        const url = `${this.API}/transactions/fixed-rate/${this.apiKey}`;

        let response;
        try {
            response = await axios.post(url, {
                from: order.pairInfo.from.toLowerCase(),
                to: order.pairInfo.to.toLowerCase(),
                address: order.destinationAddress,
                refundAddress: order.refundAddress,
                amount: bigintToString(order.sendAmount)
            });
        } catch (e) {
            if (e?.code != "ERR_BAD_RESPONSE")
                throw e;

            throw new CoinSwapError(`${e.response.status} error: ${e.response.data.message} (${e.response.data.error})`);
        }

        if (!response)
            throw new CoinSwapError('Invalid response from provider');

        if (response.data?.refundAddress != order.refundAddress ||
            response.data?.payoutAddress != order.destinationAddress ||
            response.data?.fromCurrency != order.pairInfo.from.toLowerCase() ||
            response.data?.toCurrency != order.pairInfo.to.toLowerCase()
        ) throw new CoinSwapError("response doesn't match request");

        const receiveAmount = stringToBigint(String(response.data.amount));
        const validUntil = Math.floor(Date.parse(response.data.validUntil) / 1000);

        if (!receiveAmount || isNaN(validUntil))
            throw new CoinSwapError('invalid response');

        if (validUntil < Date.now() / 1000)
            throw new CoinSwapError('response is already stale');

        // If the amount we're supposed to receive is less than the expected amount by more than 1 FIRO, throw an error
        // and refuse to continue.
        const expectedReceiveAmount = order.sendAmount * order.pairInfo.rate / (10n**8n);
        if (expectedReceiveAmount - order.pairInfo.rate > receiveAmount)
            throw new CoinSwapError(`We expected to receive ${bigintToString(expectedReceiveAmount)} ` +
                `${order.pairInfo.to} but got a promise of only ${bigintToString(receiveAmount)}.`)

        return {
            provider: this.provider,

            sendAmount: order.sendAmount,
            refundAddress: order.refundAddress,
            destinationAddress: order.destinationAddress,

            from: order.pairInfo.from,
            to: order.pairInfo.to,
            rate: order.pairInfo.rate,
            fee: order.pairInfo.fee,

            orderId: response.data.id,
            exchangeAddress: response.data.payinAddress,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000),
            validUntil
        };
    }

    async fetchMarketInfoIfOutdated() {
        if (!this.marketInfo || this.fetchTime < Date.now() - this.refreshInterval) {
            const response = await axios.get(`${this.API}/market-info/fixed-rate/${this.apiKey}`);
            this.marketInfo = response.data.map(info => ({
                provider: this.provider,
                quoteId: null,
                from: info.from.toUpperCase(),
                to: info.to.toUpperCase(),
                rate: stringToBigint(String(info.rate)),
                fee: stringToBigint(String(info.minerFee)),
                min: stringToBigint(String(info.min)),
                max: stringToBigint(String(info.max))
            }));
            this.fetchTime = Date.now();
        }
    }
}

export class ExolixApi extends AbstractCoinSwapApi {
    API: string = 'https:///exolix.com/api';
    provider: Provider = 'Exolix';

    constructor(apiKey: ApiKey) {
        super();
        this.apiKey = apiKey;
    }

    async getPairs(): Promise<[Ticker, Ticker][]> {
        return [
            ["FIRO", "BTC"],
            ["BTC", "FIRO"],
            ["ETH", "FIRO"],
            ["FIRO", "ETH"],
            ["ZEC", "FIRO"],
            ["FIRO", "ZEC"],
            ["LTC", "FIRO"],
            ["FIRO", "LTC"],
            ["XRP", "FIRO"],
            ["FIRO", "XRP"],
            ["XLM", "FIRO"],
            ["FIRO", "XLM"],
            ["BNB", "FIRO"],
            ["FIRO", "BNB"],
            ["USDT", "FIRO"],
            ["FIRO", "USDT"],
            ["USDC", "FIRO"],
            ["FIRO", "USDC"],
            ["DAI", "FIRO"],
            ["FIRO", "DAI"],
            ["DASH", "FIRO"],
            ["FIRO", "DASH"],
            ["DCR", "FIRO"],
            ["FIRO", "DCR"],
            ["BCH", "FIRO"],
            ["FIRO", "BCH"]
        ];
    }

    async getPairInfo(from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo> {
        let r;

        try {
            r = await axios.post(
                `${this.API}/rate`,
                {
                    coin_from: from,
                    coin_to: to,
                    deposit_amount: bigintToString(amount) || '0'
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.apiKey
                    }
                }
            );
        } catch (e) {
            if (e?.response?.data?.detail)
                throw e.response.data.detail;

            throw e;
        }

        if (r.data.message)
            throw r.data.message;

        return {
            provider: this.provider,
            quoteId: null,
            from,
            to,
            rate: stringToBigint(r.data.rate),
            min: stringToBigint(r.data.min_amount),
            max: null,
            fee: 0n
        };
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderInfo> {
        const response = await axios.get(
            `${this.API}/exchange/${orderId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiKey
                }
            }
        );

        return {
            provider: this.provider,

            sendAmount: stringToBigint(String(response.data.amount_from)),
            refundAddress: response.data.refund_address,
            destinationAddress: response.data.destination_address,

            from: response.data.coin_from.toUpperCase(),
            to: response.data.coin_to.toUpperCase(),
            rate: stringToBigint(String(response.data.rate)),
            fee: 0n,

            orderId: response.data.id,
            exchangeAddress: response.data.deposit_address,
            status: response.data.status,
            receiveAmount: stringToBigint(String(response.data.amount_to)),

            fromTxId: response.data.hash_in || undefined,
            toTxId: response.data.hash_out || undefined,
            refundTxId: undefined,

            createdAt:Date.parse(response.data.created_at),
            receivedAt: undefined,
            updatedAt: undefined,
            validUntil: Date.parse(response.data.created_at) + 60 * 60 * 24
        };
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        const url = `${this.API}/v2/transactions`;

        let response;
        try {
            response = await axios.post(url, {
                coinFrom: order.pairInfo.from,
                coinTo: order.pairInfo.to,
                withdrawalAddress: order.destinationAddress,
                refundAddress: order.refundAddress,
                amount: Number(bigintToString(order.sendAmount))
            });
        } catch (e) {
            throw Object.values(e?.response?.data?.errors || {})[0] || e;
        }

        if (!response)
            throw new Error('Invalid response from provider');

        if (response.data?.refundAddress != order.refundAddress ||
            response.data?.withdrawalAddress != order.destinationAddress ||
            response.data?.coinFrom?.coinCode != order.pairInfo.from ||
            response.data?.coinTo?.coinCode != order.pairInfo.to
        ) throw new Error("response doesn't match request");

        const receiveAmount = stringToBigint(String(response.data.amountTo));
        if (!receiveAmount)
            throw new Error('invalid response');

        // If the amount we're supposed to receive is less than the expected amount by more than 1 FIRO, throw an error
        // and refuse to continue.
        const expectedReceiveAmount = order.sendAmount * order.pairInfo.rate / (10n**8n);
        if (expectedReceiveAmount - order.pairInfo.rate > receiveAmount)
            throw new Error(`We expected to receive ${bigintToString(expectedReceiveAmount)} ` +
                `${order.pairInfo.to} but got a promise of only ${bigintToString(receiveAmount)}.`)

        return {
            provider: this.provider,

            sendAmount: order.sendAmount,
            refundAddress: order.refundAddress,
            destinationAddress: order.destinationAddress,

            from: order.pairInfo.from,
            to: order.pairInfo.to,
            rate: order.pairInfo.rate,
            fee: order.pairInfo.fee,

            orderId: response.data.id,
            exchangeAddress: response.data.depositAddress,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000)
        };
    }
}

const ApiClasses = {
    ChangeNow: ChangeNowApi,
    Exolix: ExolixApi
};

export class CoinSwapApiWrapper {
    apis: {[provider: string]: AbstractCoinSwapApi};

    constructor(keys: {[provider: string]: string}) {
        this.apis = {};
        for (const provider of PROVIDERS) {
            if (keys[provider])
                this.apis[provider] = new ApiClasses[provider](keys[provider]);
            else
                console.debug(`We don't have API keys for CoinSwap provider ${provider}`);
        }
    }

    async getPairs(provider: Provider): Promise<[Ticker, Ticker][]> {
        if (!this.apis[provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[provider].getPairs();
    }

    async getPairInfo(provider: Provider, from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo> {
        if (!this.apis[provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[provider].getPairInfo(from, to, amount);
    }

    async getOrderStatus(provider: Provider, orderId: OrderId): Promise<OrderInfo> {
        if (!this.apis[provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[provider].getOrderStatus(orderId);
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        if (!this.apis[order.pairInfo.provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[order.pairInfo.provider].makeOrder(order);
    }
}