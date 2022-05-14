import { ipcRenderer } from 'electron'

class StealthAPIWorker {
    API_URL = 'https://api.stealthex.io/api/v2/';

    async getMarketInfo() {        
        const data = await ipcRenderer.invoke('stealth-pair');
        return data;
    }
    
    async getMin(from, to) {        
        const data = await ipcRenderer.invoke('stealth-min', from, to);
        return data;
    }

    async getRate(from, to, amount) {        
        const data = await ipcRenderer.invoke('stealth-rate', from, to, amount);
        return data;
    }

    async postOrder({ currency_from, currency_to, address_to, amount_from, refund_address}) {
        const data = await ipcRenderer.invoke('stealth-post', currency_from, currency_to, address_to, amount_from, refund_address);
        return data;
    }
}

export default StealthAPIWorker;
