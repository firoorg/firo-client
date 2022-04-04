import Utils from './coinswap-utils';
import axios from 'axios';

class SwapzoneAPIWorker {
    API_URL = 'https://api.swapzone.io/v1/exchange/';

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

    async getMarketInfo() {
        const url = `${this.API_URL}currencies`;
        const config = {
            method: 'get',
            url: url,
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': 'dHDar8ZIx'
            }
        };

        const [serverError, temp] = await Utils.to(
            axios(config)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);
        
        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getRate(from, to, amount) {       
        const url = `${this.API_URL}get-rate?from=${from}&to=${to}&amount=${amount}&rateType=fixed`
        
        const config = {
            method: 'get',
            url: url,
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': 'dHDar8ZIx'
            }
        };
        const result = await axios(config)
        return result.data;
    }

    async postOrder({ from, to, addressReceive, amountDeposit, quotaId, refundAddress }) {
        const url = `${this.API_URL}create`;

        const body = JSON.stringify({
            "from": from,
            "to": to,
            "addressReceive": addressReceive,
            "amountDeposit": amountDeposit,
            "refundAddress": refundAddress,
            "quotaId": quotaId
        });

        const config = {
            method: 'post',
            url: url,
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': 'dHDar8ZIx'
            },
            data:body
        };

        const [serverError, temp] = await Utils.to(
            axios(config)
        );
        const response = temp.data.transaction;
        const errorMessage = this.errorMessage(serverError, temp);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }
}

export default SwapzoneAPIWorker;
