import Http from './http-utils';
import Utils from './coinswap-utils';
import axios from 'axios';
import { ipcRenderer } from 'electron'


class StealthAPIWorker {
    
    //API_URI = 'https://api.changenow.io/v1/';
    API_URI = 'https://api.stealthex.io/api/v2/';

    buildUrl({ url, params }) {
        const query = [];

        for (let key in params) {
            if (typeof params[key] === 'object') {
                for (let k in params[key]) {
                    query.push(k + '=' + params[key][k]);
                }
            } else {
                query.push(key + '=' + params[key]);
            }
        }

        return `${url}?${query.join('&')}`;
    }

    errorMessage(serverError, response) {
        if (serverError) {
            return serverError.message;
        }

        if (response.error){
            console.log(`${response.error}: ${response.reason}`);
            return response.reason;
        }

        return;
    }

    // async getMarketInfo() -> Promise<{
    //   error?: string, // the error response, if any; error XOR response will be set.
    //   response?: {
    //     pair: string,     // CUR1-CUR2 eg. USDT-FIRO
    //     quote: string,    // the string-encoded rational number of currency CUR1 equal to CUR2, eg. "3.1415"
    //     expiryTs: number, // the UNIX timestamp until which the information is valid
    //     minerFee: number, // the satoshi amount miner fee
    //     minLimit: number, // the minimum amount of CUR1 that must be sent
    //     maxLimit: number, // the maximum amount of CUR1 that must be sent
    //     signature: string // a UUID representing the pair/quote
    //   }[],
    // }>
    async getMarketInfo() {
        const url = `${this.API_URI}marketinfo/`;

        const [serverError, response] = await Utils.to(
            Http.get({
                url
            })
        );

        const errorMessage = this.errorMessage(serverError, response);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getAvailableCurrency() {        
        // await ipcRenderer.invoke('stealth-pair').then((data) => {
        //     //console.log(data);
        //     return data;
        // }).catch((resp) => console.warn(resp))
        const data = await ipcRenderer.invoke('stealth-pair');
        return data;
    }
    
    async getRange(from, to) {        
        // await ipcRenderer.invoke('stealth-pair').then((data) => {
        //     //console.log(data);
        //     return data;
        // }).catch((resp) => console.warn(resp))
        const data = await ipcRenderer.invoke('stealth-range', from, to);
        return data;
    }

    async getRate() {        
        // await ipcRenderer.invoke('stealth-pair').then((data) => {
        //     //console.log(data);
        //     return data;
        // }).catch((resp) => console.warn(resp))
        const data = await ipcRenderer.invoke('stealth-rate');
        return data;
    }


    async getOffer({ pair, amount }) {
        const params = { pair };

        if (amount) params.amount = amount;

        const uri = this.buildUrl({ url: `${this.API_URI}offer`, params });

        const [serverError, response] = await Utils.to(
            Http.get({
                url: uri
            })
        );

        const errorMessage = this.errorMessage(serverError, response);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getOrderStatus({ orderId }) {
        const uri = `${this.API_URI}order/${orderId}`;

        const [serverError, response] = await Utils.to(
            Http.get({
                url: uri
            })
        );

        const errorMessage = this.errorMessage(serverError, response);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getOrdersInfo({ limit, page, sort }) {
        const params = {};

        if (limit) params.limit = limit;
        if (page) params.page = page;
        if (sort) params.sort = sort;

        const uri = buildUrl({ url: `${this.API_URI}ordersinfo/`, params });

        const [serverError, response] = await Utils.to(
            Http.get({
                url: uri
            })
        );
        const errorMessage = this.errorMessage(serverError, response);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async postOrder({ toAddress, refundAddress, pair, fromAmount, toAmount, signature, userIP }) {
        const uri = `${this.API_URI}order/`;

        const body = {
            toAddress,
            refundAddress,
            pair
        };

        if (fromAmount) {
            body.fromAmount = fromAmount;
        } else if (toAmount) {
            body.toAmount = toAmount;
        } else {
            console.log('switchainApiClient.postOrder.error.requiredFromAmountOrToAmountField');
        }

        if (signature) body.signature = signature;

        const headers = {};

        if (userIP) headers['x-user-ip'] = userIP;

        const [serverError, response] = await Utils.to(
            Http.post({
                url: uri,
                headers,
                options: {
                    data: JSON.stringify(body)
                }
            })
        );

        const errorMessage = this.errorMessage(serverError, response);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }
}

export default StealthAPIWorker;
