// background.js
import { ipcMain } from 'electron'
import axios from 'axios';

import Vue from 'vue'
import Vuex from 'vuex'

import AddressBook from "store/modules/AddressBook";
import ApiStatus from "store/modules/ApiStatus";
import App from "store/modules/App";
import Balance from "store/modules/Balance";
import Blockchain from "store/modules/Blockchain";
import CoinSwap from "store/modules/CoinSwap";
import Elysium from "store/modules/Elysium";
import Masternode from "store/modules/Masternode";
import Settings from "store/modules/Settings";
import Transactions from "store/modules/Transactions";
import Utils from '../lib/coinswap-utils';
import { createLogger } from 'lib/logger'

const logger = createLogger('firo:store:main')

Vue.use(Vuex)

const clients = []

const store = new Vuex.Store({
    modules: {
        AddressBook,
        ApiStatus,
        App,
        Balance,
        Blockchain,
        CoinSwap,
        Elysium,
        Masternode,
        Settings,
        Transactions
    }
})

store.subscribe((mutation, state) => {
    Object.keys(clients).forEach((id) => {
        clients[id].send('vuex-apply-mutation', mutation)
    })
})

ipcMain.on('vuex-connect', (event) => {
    const win = event.sender
    let winId = win.id
    logger.info('[background] vuex connected', winId)

    win.on('destroyed', () => {
        clients[winId] = null
        delete clients[winId]
    })

    clients[winId] = event.sender
    event.returnValue = store.state
})

ipcMain.on('vuex-mutation', (event, args) => {
    try {
        const {type, payload} = args
        store.commit(type, payload)
    } catch (error) {
        logger.warn('error during vuex-mutation')
        logger.error(error)
        logger.debug("%O", args)
        event.sender.send('vuex-error', error)
    }
})

ipcMain.on('vuex-action', (event, args) => {
    try {
        const {content, payload} = args
        logger.debug('vuex-action: %o\npayload: %o', content, payload)
        store.dispatch(...args)
    } catch (error) {
        logger.warn('error during vuex-action')
        logger.error(error)
        logger.debug("%O", args)
        event.sender.send('vuex-error', error)
    }
})

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
        console.log(`${temp.error}: ${temp.reason}`);
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
        console.log(`${temp.error}: ${temp.reason}`);
        return {error: temp.reason};
    }

    const response = temp.data;
    return { error: null, response };
})

export default store
