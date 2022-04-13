import Utils from './coinswap-utils';
import axios from 'axios';
import { ipcRenderer } from 'electron'
import keys from '../keys';

class ChangeAPIWorker {
    API_URL = 'https://api.changenow.io/v1/';

    errorMessage(serverError, response) {
        if (serverError) {
            return serverError.message;
        }

        if (response.error){
            console.log(`${response.error}: ${response.reason}`);
            return response.reason;
        }
    }

    async getMarketInfo() {
        const url = `${this.API_URL}market-info/fixed-rate/${keys.CHANGENOW_TOKEN}`;
        console.log(this.API_URL);
        const [serverError, temp] = await Utils.to(
            axios.get(url)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);
        
        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }

    async getOrderStatus({ orderId, chainName }) {    
        let url;
        let config;
        
        if (chainName==="StealthEx") {
            const data = await ipcRenderer.invoke('stealth-status', orderId);
            return data;
        } else if (chainName==="Swapzone") {            
            url = `https://api.swapzone.io/v1/exchange/tx?id=${orderId}`;
            config = {
                method: 'get',
                url: url,
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': keys.CHANGENOW_API_KEY
                }
            };
            const [serverError, temp] = await Utils.to(
                axios(config)
            );
            const response = temp.data.transaction;
            const errorMessage = this.errorMessage(serverError, temp);
    
            if (errorMessage) return { error: errorMessage };
    
            return { error: null, response };
        } else if (chainName==="Exolix") {            
            url = `https:///exolix.com/api/exchange/${orderId}`;
            config = {
                method: 'get',
                url: url,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': this.AUTHORIZATION
                }
            };
            const [serverError, temp] = await Utils.to(
                axios(config)
            );
            const response = temp.data;
            const errorMessage = this.errorMessage(serverError, temp);
    
            if (errorMessage) return { error: errorMessage };
    
            return { error: null, response };
        } else {            
            url = `${this.API_URL}transactions/${orderId}/${keys.CHANGENOW_TOKEN}`;
            config = {
                method: 'get',
                url: url,
                headers: { 
                    'Content-Type': 'application/json'
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
    }

    async postOrder({ from, to, address, amount, extraId, refundAddress, refundExtraId, userId, payload, contactEmail }) {
        const url = `${this.API_URL}transactions/fixed-rate//${keys.CHANGENOW_TOKEN}`;

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
        }
        
        const [serverError, temp] = await Utils.to(
            axios.post(url, body)
        );
        const response = temp.data;
        const errorMessage = this.errorMessage(serverError, temp);

        if (errorMessage) return { error: errorMessage };

        return { error: null, response };
    }
}

export default ChangeAPIWorker;
