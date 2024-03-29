import axios from 'axios';
import {bigintToString, stringToBigint} from './convert';

export type Provider = 'ChangeNow' | 'StealthEx' | 'Exolix' | 'HoudiniSwap' | 'Majestic';
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

export interface OrderStatusInfo {
    status: OrderStatus;
    receivedAt?: Timestamp;
    fromTxId?: TransactionId;
    toTxId?: TransactionId;
    refundTxId?: TransactionId;
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
    hasRefundAddress: boolean = true;

    abstract getPairs(): Promise<[Ticker, Ticker][]>;
    abstract getPairInfo(from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo>;
    abstract getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo>;
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

        return this.marketInfo
            .filter(info => (info.from == 'FIRO') != (info.to == 'FIRO'))
            .map(info => [info.from, info.to]);
    }

    async getPairInfo(from: string, to: string, amount: bigint): Promise<PairInfo> {
        await this.fetchMarketInfoIfOutdated();

        const pairInfo = this.marketInfo.find(info => info.from == from && info.to == to);
        if (!pairInfo)
            throw new UnavailablePairError(from, to);

        return pairInfo;
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo> {
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
            status: response.data.status,
            fromTxId: response.data.payinHash || undefined,
            toTxId: response.data.payoutHash || undefined,
            refundTxId: response.data.refundHash || undefined,
            receivedAt: response.data.depositReceivedAt && Math.floor(Date.parse(response.data.depositReceivedAt) / 1000),
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
        return ["BTC", "ETH", "ZEC", "LTC", "XRP", "XLM", "BNB", "USDT", "USDC", "DAI", "DASH", "DCR", "BCH"]
            .map((ticker: Ticker): [Ticker, Ticker][] => [["FIRO", ticker], [ticker, "FIRO"]])
            .reduce((a, x) => [...a, ...x], []);
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

    async getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo> {
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
            status: response.data.status,
            fromTxId: response.data.hash_in || undefined,
            toTxId: response.data.hash_out || undefined,
            refundTxId: undefined,
            receivedAt: undefined
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
            throw new CoinSwapError('Invalid response from provider');

        if (response.data?.refundAddress != order.refundAddress ||
            response.data?.withdrawalAddress != order.destinationAddress ||
            response.data?.coinFrom?.coinCode != order.pairInfo.from ||
            response.data?.coinTo?.coinCode != order.pairInfo.to
        ) throw new CoinSwapError("response doesn't match request");

        const receiveAmount = stringToBigint(String(response.data.amountTo));
        if (!receiveAmount)
            throw new CoinSwapError('invalid response');

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
            exchangeAddress: response.data.depositAddress,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000)
        };
    }
}
export class StealthExApi extends AbstractCoinSwapApi {
    API: string = 'https://api.stealthex.io/api/v2';
    provider: Provider = 'StealthEx';
    pairs: [Ticker, Ticker][];

    constructor(apiKey: ApiKey) {
        super();
        this.apiKey = apiKey;
    }

    async getPairs(): Promise<[Ticker, Ticker][]> {
        if (this.pairs)
            return this.pairs;

        const r = await axios.get(`${this.API}/pairs/firo?api_key=${this.apiKey}`);
        this.pairs = r.data
            .map(ticker => [['FIRO', ticker.toUpperCase()], [ticker.toUpperCase(), 'FIRO']])
            .reduce((a, x) => [...a, ...x], []);

        return this.pairs;
    }

    async getPairInfo(from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo> {
        if (!amount)
            throw new CoinSwapError('amount must be specified');

        const r = await axios.get(`${this.API}/estimate/${from}/${to}?amount=${bigintToString(amount)}&api_key=${this.apiKey}`);

        const toReceive = stringToBigint(r.data.estimated_amount);
        if (!toReceive)
            throw 'invalid response';

        const rate = (toReceive * 10n**8n) / amount;

        return {
            provider: this.provider,
            quoteId: null,
            from,
            to,
            rate,
            min: amount,
            max: amount,
            fee: 0n
        };
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo> {
        const r = await axios.get(`${this.API}/exchange/${orderId}?api_key=${this.apiKey}`);

        const rate = stringToBigint(r.data.amount_from) * 10n ** 8n / stringToBigint(r.data.amount_to);

        return {
            status: r.data.status,
            fromTxId: r.data.tx_from || undefined,
            toTxId: r.data.tx_to || undefined,
            refundTxId: undefined,
            receivedAt: Date.parse(r.data.updated_at)
        };
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        let response;
        try {
            response = await axios.post(`${this.API}/exchange?api_key=${this.apiKey}`, {
                currency_from: order.pairInfo.from,
                currency_to: order.pairInfo.to,
                address_to: order.destinationAddress,
                refund_address: order.refundAddress,
                amount_from: bigintToString(order.sendAmount)
            });
        } catch (e) {
            if (e?.response?.data?.message)
                throw new CoinSwapError(e.response.data.message);

            throw e;
        }

        if (!response)
            throw new CoinSwapError('Invalid response from provider');

        if (response.data?.refund_address != order.refundAddress ||
            response.data?.address_to != order.destinationAddress ||
            response.data?.currency_from.toUpperCase() != order.pairInfo.from ||
            response.data?.currency_to.toUpperCase() != order.pairInfo.to
        ) throw new CoinSwapError("response doesn't match request");

        const receiveAmount = stringToBigint(response.data.amount_to);
        if (!receiveAmount)
            throw new CoinSwapError('invalid response');

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
            exchangeAddress: response.data.address_from,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000)
        };
    }
}

export class HoudiniSwapApi extends AbstractCoinSwapApi {
    API: string = 'https://api-partner.houdiniswap.com';
    provider: Provider = 'HoudiniSwap';
    hasRefundAddress: boolean = false;

    constructor(apiKey: ApiKey) {
        super();
        this.apiKey = apiKey;
    }

    async getPairs(): Promise<[Ticker, Ticker][]> {
        return <[Ticker, Ticker][]>['BTC', 'BNB', 'DASH', 'DCR', 'ETH', 'LTC']
            .map(ticker => [['FIRO', ticker], [ticker, 'FIRO']])
            .reduce((a, x) => [...a, ...x], []);
    }

    async getPairInfo(from: Ticker, to: Ticker, amount: bigint): Promise<PairInfo> {
        if (!amount)
            throw new CoinSwapError('amount must be specified');

        const r = await axios.get(`${this.API}/quote?amount=${bigintToString(amount)}&from=${from}&to=${to}&anonymous=true`, {
            headers: {
                Authorization: this.apiKey
            }
        });

        const toReceive = stringToBigint(String(r.data.amountOut));
        if (!toReceive)
            throw 'invalid response';

        const rate = (toReceive * 10n**8n) / amount;

        return {
            provider: this.provider,
            quoteId: null,
            from,
            to,
            rate,
            min: stringToBigint(String(r.data.min)),
            max: stringToBigint(String(r.data.max)),
            fee: 0n
        };
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo> {
        const r = await axios.get(`${this.API}/status?id=${orderId}`, {
            headers: {
                Authorization: this.apiKey
            }
        });

        const rate = stringToBigint(String(r.data.inAmount)) * 10n ** 8n / stringToBigint(String(r.data.outAmount));
        const validUntil = Date.parse(r.data.expires);

        let status: OrderStatus;
        if (r.data.status == 0 && Date.now() > validUntil)
            status = 'expired';
        else if (r.data.status == 0)
            status = 'waiting';
        else if (r.data.status == 1)
            status = 'received'
        else if (r.data.status == 4)
            status = 'finished';
        else
            status = <OrderStatus>String(r.data.status);

        return {
            status,
            fromTxId: undefined,
            toTxId: undefined,
            refundTxId: undefined,
            receivedAt: Date.parse(r.data.created)
        };
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        const response = await axios.post(`${this.API}/exchange`, {
            amount: Number(bigintToString(order.sendAmount)),
            from: order.pairInfo.from,
            to: order.pairInfo.to,
            receiverTag: '',
            addressTo: order.destinationAddress,
            anonymous: true,
            fixed: true,
            direction: "from",
            ip: "0.0.0.0",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            timezone: "UTC"
        }, {
            headers: {
                Authorization: this.apiKey
            }
        });

        if (response.data?.receiverAddress != order.destinationAddress ||
            response.data?.inSymbol != order.pairInfo.from ||
            response.data?.outSymbol != order.pairInfo.to
        ) throw new CoinSwapError("response doesn't match request");

        const receiveAmount = stringToBigint(String(response.data.outAmount));
        if (!receiveAmount)
            throw new CoinSwapError('invalid response');

        // If the amount we're supposed to receive is less than the expected amount by more than 1 FIRO, throw an error
        // and refuse to continue.
        const expectedReceiveAmount = order.sendAmount * order.pairInfo.rate / (10n**8n);
        if (expectedReceiveAmount - order.pairInfo.rate > receiveAmount)
            throw new CoinSwapError(`We expected to receive ${bigintToString(expectedReceiveAmount)} ` +
                `${order.pairInfo.to} but got a promise of only ${bigintToString(receiveAmount)}.`)

        return {
            provider: this.provider,

            sendAmount: order.sendAmount,
            refundAddress: undefined,
            destinationAddress: order.destinationAddress,

            from: order.pairInfo.from,
            to: order.pairInfo.to,
            rate: order.pairInfo.rate,
            fee: order.pairInfo.fee,

            orderId: response.data.houdiniId,
            exchangeAddress: response.data.senderAddress,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000)
        };
    }
}

export class MajesticApi extends AbstractCoinSwapApi {
    API: string = 'https://www.bk.majesticbank.sc/api/v1';
    provider: Provider = 'Majestic';
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

        return this.marketInfo
            .filter(info => (info.from == 'FIRO') != (info.to == 'FIRO'))
            .map(info => [info.from, info.to]);
    }

    async getPairInfo(from: string, to: string, amount: bigint): Promise<PairInfo> {
        await this.fetchMarketInfoIfOutdated();

        const pairInfo = this.marketInfo.find(info => info.from == from && info.to == to);
        if (!pairInfo)
            throw new UnavailablePairError(from, to);

        return pairInfo;
    }

    async getOrderStatus(orderId: OrderId): Promise<OrderStatusInfo> {
        const response = await axios.get(`${this.API}/track?trx=${orderId}`);

        let status = response.data.status;
        if (status == 'Processing payment')
            status = 'waiting';
        else if (status == 'Completed')
            status = 'finished';


        return {
            status: status,
            fromTxId: undefined,
            toTxId: undefined,
            refundTxId: undefined,
            receivedAt: undefined
        };
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        const url = `${this.API}/exchange`;

        const response = await axios.post(url, {
            from_currency: order.pairInfo.from,
            receive_currency: order.pairInfo.to,
            receive_address: order.destinationAddress,
            from_amount: bigintToString(order.sendAmount),
            referral_code: this.apiKey
        });

        if (typeof response.data == 'string') {
            console.warn(`Got error response from ${this.provider}:`);
            console.warn(response.data);

            throw new CoinSwapError('unknown error posting order');
        }

        if (response.data?.from_currency != order.pairInfo.from ||
            response.data?.receive_currency != order.pairInfo.to
        ) throw new CoinSwapError("response doesn't match request");

        const receiveAmount = stringToBigint(String(response.data.receive_amount));
        const validUntil = Date.now() / 1000 + 60 * Number(response.data.expiration);

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

            orderId: response.data.trx,
            exchangeAddress: response.data.address,
            status: 'waiting',
            receiveAmount,

            createdAt: Math.floor(Date.now() / 1000),
            validUntil
        };
    }

    async fetchMarketInfoIfOutdated() {
        if (!this.marketInfo || this.fetchTime < Date.now() - this.refreshInterval) {
            const response = await axios.get(`${this.API}/rates`);

            const pairs = Object.keys(response.data)
                .map(k => k.match(/^([A-Z]+)-([A-Z]+)$/)?.slice(1))
                .filter(x=>x);

            this.marketInfo = pairs.map(([from, to]) => ({
                provider: this.provider,
                quoteId: null,
                from,
                to,
                rate: stringToBigint(Number(response.data[`${from}-${to}`]).toFixed(8)),
                fee: 0n,
                min: stringToBigint(Number(response.data.limits[from].min).toFixed(8)),
                max: stringToBigint(Number(response.data.limits[from].max).toFixed(8))
            }));

            this.fetchTime = Date.now();
        }
    }
}

const ApiClasses = {
    ChangeNow: ChangeNowApi,
    Exolix: ExolixApi,
    StealthEx: StealthExApi,
    HoudiniSwap: HoudiniSwapApi,
    Majestic: MajesticApi
};
export const PROVIDERS: Provider[] = <Provider[]>Object.keys(ApiClasses);

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

    async getOrderStatus(provider: Provider, orderId: OrderId): Promise<OrderStatusInfo> {
        if (!this.apis[provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[provider].getOrderStatus(orderId);
    }

    async makeOrder(order: Order): Promise<OrderInfo> {
        if (!this.apis[order.pairInfo.provider])
            throw new CoinSwapError('unknown provider');

        return await this.apis[order.pairInfo.provider].makeOrder(order);
    }

    hasRefundAddress(provider: Provider): boolean {
        if (!this.apis[provider])
            throw new CoinSwapError('unknown provider');

        return this.apis[provider].hasRefundAddress;
    }
}