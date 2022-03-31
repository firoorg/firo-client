import Http from './http-utils';
import Utils from './coinswap-utils';
import axios from 'axios';

class ChangeAPIWorker {
    API_URI = 'https://api.changenow.io/v1/';
    //API_URI = 'https://api.stealthex.io/api/v2/';

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
    //     from: string,     // eg. usdt
    //     to: string,    // btc
    //     rate: number, // rate
    //     minerFee: number, // the satoshi amount miner fee
    //     min: number, // the minimum amount of CUR1 that must be sent
    //     max: number, // the maximum amount of CUR1 that must be sent
    //   }[],
    // }>
    async getMarketInfo() {
        const uri = `${this.API_URI}market-info/fixed-rate/1de3010c3462e7d532d0ac373e848ef59c617cc69f70de4feefc0f78da51ad9b`;

        const [serverError, temp] = await Utils.to(
            axios.get(uri)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);
        
        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
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

    // async getOrderStatus({ orderId }) {
    //     const uri = `${this.API_URI}order/${orderId}`;

    //     const [serverError, response] = await Utils.to(
    //         Http.get({
    //             url: uri
    //         })
    //     );

    //     const errorMessage = this.errorMessage(serverError, response);

    //     if (errorMessage) return { error: errorMessage };

    //     return { error: null, response };
    // }

    async getOrderStatus({ orderId }) {
        const uri = `${this.API_URI}transactions/${orderId}/1de3010c3462e7d532d0ac373e848ef59c617cc69f70de4feefc0f78da51ad9b`;

        const [serverError, temp] = await Utils.to(
            //Http.get({ url: uri })
            axios.get(uri)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);

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

    // async postOrder({ toAddress, refundAddress, pair, fromAmount, toAmount, signature, userIP }) {
    //     const uri = `${this.API_URI}order/`;

    //     const body = {
    //         toAddress,
    //         refundAddress,
    //         pair
    //     };

    //     if (fromAmount) {
    //         body.fromAmount = fromAmount;
    //     } else if (toAmount) {
    //         body.toAmount = toAmount;
    //     } else {
    //         console.log('switchainApiClient.postOrder.error.requiredFromAmountOrToAmountField');
    //     }

    //     if (signature) body.signature = signature;

    //     const headers = {};

    //     if (userIP) headers['x-user-ip'] = userIP;

    //     const [serverError, response] = await Utils.to(
    //         Http.post({
    //             url: uri,
    //             headers,
    //             options: {
    //                 data: JSON.stringify(body)
    //             }
    //         })
    //     );

    //     const errorMessage = this.errorMessage(serverError, response);

    //     if (errorMessage) return { error: errorMessage };

    //     return { error: null, response };
    // }

    async postOrder({ from, to, address, amount, extraId, refundAddress, refundExtraId, userId, payload, contactEmail }) {
        const uri = `${this.API_URI}transactions/fixed-rate/1de3010c3462e7d532d0ac373e848ef59c617cc69f70de4feefc0f78da51ad9b`;

        const body = {
            from,
            to,
            address,
            amount,
            refundAddress,
        };

        if (extraId) {
            body.extraId = extraId;
        } else if (refundExtraId) {
            body.refundExtraId = refundExtraId;
        } else if (userId) {
            body.userId = userId;
        } else if (payload) {
            body.payload = payload;
        } else if (refundExtraId) {
            body.contactEmail = contactEmail;
        }
        
        const headers = {};
        headers['Content-Type'] = "application/json";

        const [serverError, temp] = await Utils.to(
            // Http.post({
            //     url: uri,
            //     headers,
            //     options: {
            //         data: JSON.stringify(body)
            //     }
            // })  
            axios.post(uri, body)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }
}

export default ChangeAPIWorker;
