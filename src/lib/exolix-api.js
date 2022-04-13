import Utils from './coinswap-utils';
import axios from 'axios';
import keys from '../keys';

class ExolixAPIWorker {
    API_URL = 'https:///exolix.com/api/';

    headers =  {
        'Content-Type': 'application/json',
        'Authorization': keys.EXOLIX_AUTHORIZATIONL
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

    async getMarketInfo() {
        const url = `${this.API_URL}currency`;
        const config = {
            method: 'get',
            url: url,
            headers: this.headers
        };

        const [serverError, temp] = await Utils.to(
            axios(config)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);
        
        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getRate(from, to, deposit_amount) {       
        const url = `${this.API_URL}rate`
        const body = JSON.stringify({
            "coin_from": from,
            "coin_to": to,
            "deposit_amount": deposit_amount
        });
        const config = {
            method: 'post',
            url: url,
            headers: this.headers,
            data:body
        };
        const result = await axios(config)
        return result.data;
    }

    async postOrder({ coin_from, coin_to, deposit_amount, destination_address, refund_address }) {
        const url = `${this.API_URL}exchange`;
        const body = JSON.stringify({
            "coin_from": coin_from,
            "coin_to": coin_to,
            "deposit_amount": deposit_amount,
            "destination_address": destination_address,
            "refund_address": refund_address,
            "destination_extra": "121212",
        });
        console.log("1-----------"+body)
        const config = {
            method: 'post',
            url: url,
            headers: this.headers,
            data:body
        };

        const [serverError, temp] = await Utils.to(
            axios(config)
        );
        const response = temp.data;
        console.log("2-----------"+response)
        const errorMessage = this.errorMessage(serverError, temp);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }
}

export default ExolixAPIWorker;
