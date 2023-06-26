// background.js
import { ipcMain } from 'electron'
import axios from 'axios';
import Utils from '../lib/coinswap-utils';

ipcMain.handle('stealth-pair', async (event, args) => {
    const url = `https://api.stealthex.io/api/v2/pairs/firo?api_key=c0092729-17aa-42f7-9e2e-6b9ff2387643`;
    const result = await axios.get(url)
    return result.data;
})

ipcMain.handle('stealth-min', async (event, from, to) => {
    const url = 'https://api.stealthex.io/api/v2/range/'+from+'/'+to+'?api_key=c0092729-17aa-42f7-9e2e-6b9ff2387643';
    const result = await axios.get(url)
    return result.data;
})

ipcMain.handle('stealth-rate', async (event, from, to, amount) => {
    const url = 'https://api.stealthex.io/api/v2/estimate/'+from+'/'+to+'?amount='+amount+'&api_key=c0092729-17aa-42f7-9e2e-6b9ff2387643';
    const result = await axios.get(url)
    return result.data;
})

ipcMain.handle('stealth-post', async (event, currency_from, currency_to, address_to, amount_from, refund_address) => {
    const url = 'https://api.stealthex.io/api/v2/exchange?api_key=c0092729-17aa-42f7-9e2e-6b9ff2387643'
    const body = {
        "currency_from":currency_from,
        "currency_to":currency_to,
        "address_to":address_to,
        "amount_from":amount_from,
        "refund_address":refund_address,
    };

    const config = {
        method: 'post',
        url: url,
        headers: {
        'Content-Type': 'application/json'
        },
        data : body
    };

    const [serverError, temp] = await Utils.to(
        axios(config)
    );

    if (serverError) {
        return {error: serverError.message};
    }

    if (temp.error){
        console.error(`${temp.error}: ${temp.reason}`);
        return {error: temp.reason};
    }

    const response = temp.data;
    return { error: null, response };
})

ipcMain.handle('stealth-status', async (event, orderId) => {
    const url = `https://api.stealthex.io/api/v2/exchange/${orderId}?api_key=c0092729-17aa-42f7-9e2e-6b9ff2387643`
    const [serverError, temp] = await Utils.to(
        axios.get(url)
    );

    if (serverError) {
        return {error: serverError.message};
    }

    if (temp.error){
        console.error(`${temp.error}: ${temp.reason}`);
        return {error: temp.reason};
    }

    const response = temp.data;
    return { error: null, response };
})

export default store
