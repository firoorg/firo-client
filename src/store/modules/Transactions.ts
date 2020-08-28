import {cloneDeep, merge} from 'lodash';
import {StateWallet, TransactionOutput, TransactionEvent, AddressBookItem, PaymentCodeItem, PaymentChannel} from '../../daemon/zcoind';

import { createLogger } from '../../lib/logger'
const logger = createLogger('zcoin:store:Transactions');

// This is the data format we're given in 'address' events.
type AddressEvent = StateWallet;

const state = {
    transactions: <{[txidAndIndex: string]: TransactionOutput}>{},
    // values are keys of transactions in state.transactions associated with the address
    addresses: <{[address: string]: string[]}>{},
    unspentUTXOs: <{[txidAndIndex:string]:boolean}>{},
    addressBook: <{[address: string]: AddressBookItem}>{},
    walletLoaded: false,
    paymentCodes: <{[label: string]: string}>{},
    paymentChannels: <{[paymentCode: string]: PaymentChannel[]}>{},
    unusedAddresses: <{[address: string]: boolean}>{}
};

const mutations = {
    setWalletState(state, initialStateWallet: StateWallet) {
        const stateTransactions = cloneDeep(state.transactions);
        const stateAddresses = cloneDeep(state.addresses);
        const stateUnspentUTXOs = cloneDeep(state.unspentUTXOs);
        const stateUnusedAddresses = cloneDeep(state.unusedAddresses);

        logger.info("Setting wallet state: %d addresses", Object.keys(initialStateWallet.addresses).length);
        var unspentAlreadyProcess = false;
        for (const address of Object.keys(initialStateWallet.addresses)) {
            const addressData = initialStateWallet.addresses[address];
            if (!['inputs', 'lockedCoins', 'unlockedCoins'].includes(address)) {
                unspentAlreadyProcess = true;
                for (const transactions of Object.values(addressData.txids)) {
                    for (const tx of Object.values(transactions)) {
                        stateUnspentUTXOs[`${tx.txid}-${tx.txIndex}-${tx.category}`] = true;

                        if (address === 'MINT' && tx.category === 'receive') {
                            // Every mint transaction appears both as a 'receive' and a 'mint'. Since we're already
                            // processing them as a 'mint' category transaction, we don't need to process it as a 'receive'
                            // category one.
                            continue;
                        }
                        tx.uniqId = `${tx.txid}-${tx.txIndex}-${tx.category}`;
                        // mined and znode transactions without a blockHeight are orphans.
                        if (['mined', 'znode'].includes(tx.category) && !tx.blockHeight) {
                            // Delete previous records associated with the transaction.
                            if (stateTransactions[tx.uniqId]) {
                                logger.silly(`Got orphan ${tx.uniqId}, deleting associated records.`);
                                delete stateTransactions[tx.uniqId];
                                delete stateUnspentUTXOs[tx.uniqId];
                                stateAddresses[tx.address] = stateAddresses[tx.address].filter(id => id !== tx.uniqId);
                            }

                            // We don't want to display orphan transactions in the UI.
                            continue;
                        }

                        stateTransactions[tx.uniqId] = tx;

                        // Mint transactions will have no associated address.
                        if (!tx.address) {
                            continue;
                        }

                        if (!stateAddresses[tx.address]) {
                            stateAddresses[tx.address] = [];
                        }
                        stateAddresses[tx.address].push(tx.uniqId);
                        delete stateUnusedAddresses[tx.address];
                    }
                }
            } else if (['lockedCoins'].includes(address)) {
                for (const outpoint of Object.values(addressData)) {
                    for (const [id, tx] of Object.entries(state.transactions)) {
                        if (id.includes(`${outpoint.txid}-${outpoint.index}-`)) {
                            stateTransactions[id].locked = true;
                        }
                    }
                }
            } else if (['unlockedCoins'].includes(address)) {
                for (const outpoint of Object.values(addressData)) {
                    for (const [id, tx] of Object.entries(state.transactions)) {
                        if (id.includes(`${outpoint.txid}-${outpoint.index}-`)) {
                            stateTransactions[id].locked = false;
                        }
                    }
                }
            }
        }

        if (initialStateWallet.addresses['inputs']) {
            const addressData = initialStateWallet.addresses['inputs'];
            for (const outpoint of Object.values(addressData)) {
                for (const [id, tx] of Object.entries(state.transactions)) {
                    //logger.info('spent: %s', id);
                    if (id.includes(`${outpoint.txid}-${outpoint.index}-`)) {
                        stateTransactions[id].spendable = false;
                        stateUnspentUTXOs[id] = false;
                        delete stateUnspentUTXOs[id];
                    }
                }
            }
        }

        state.addresses = stateAddresses;
        state.transactions = stateTransactions;
        state.unspentUTXOs = stateUnspentUTXOs;
        state.unusedAddresses = stateUnusedAddresses;
        state.walletLoaded = true;
    },

    setLockState(state, uniqIds: string[]) {
        for(const uniqId of uniqIds) {
            state.transactions[uniqId].locked = !state.transactions[uniqId].locked;
        }
        state.transactions = {...state.transactions};
    },

    setHasMnemonic(state, hasM: boolean) {
        state.hasMnemonic = hasM;
        state.hasMnemonic = {...state.hasMnemonic};
    },

    setShouldShowWarning(state, warning: boolean) {
        state.shouldShowWarning = warning;
        state.shouldShowWarning = {...state.shouldShowWarning};
    },

    setAddressBook(state, addressBook_: AddressBookItem[]) {
        addressBook_.forEach(e => {
            state.addressBook[e.address] = e;
            if (e.purpose == "receive") {
                if (!state.addresses[e.address]) {
                    state.unusedAddresses[e.address] = true; 
                } else {
                    delete state.unusedAddresses[e.address];
                }
            }
        })
        state.addressBook = {...state.addressBook};
        state.unusedAddresses = {...state.unusedAddresses};
    },

    setPaymentChannels(state, paymentChannels_: PaymentChannel[][]) {
        paymentChannels_.forEach(e => {
            state.paymentChannels[e[0].paymentCode] = e;
        })
        state.paymentChannels = {...state.paymentChannels};
    },

    setPaymentCodes(state, pcs: PaymentCodeItem[]) {
        pcs.forEach(e => {
            state.paymentCodes[e.paymentcode] = e.label;
        })
        state.paymentCodes = {...state.paymentCodes};
    },

    deleteAddressItem(state, address: string) {
        delete state.addressBook[address];
        state.addressBook = {...state.addressBook};
    },

    addAddressItem(state, item: AddressBookItem) {
        state.addressBook[item.address] = item;
        if (item.purpose == "receive") {
            if (!state.addresses[item.address]) {
                state.unusedAddresses[item.address] = true; 
            } else {
                delete state.unusedAddresses[item.address];
            }
            state.unusedAddresses = {...state.unusedAddresses};
        }
        state.addressBook = {...state.addressBook};
    }
};

// Used to cache multiple transactions coming in quick succession.
let cachedInitialStateWallets: StateWallet[] = [];
let lastStateWalletTime: number;
let hasStartedCachedStateWalletWatcher = false;

const actions = {
    // We're called every second and are responsible for consolidation stateWallet events into a single update. Our
    // interval timer is set the first time a call to addCachedStateWallet is made.
    maybeDoStateWallet({commit}) {
        // If there are no items in cachedInitialStateWallet or it's been less than 1 second since the last item was
        // added, do nothing.
        if (!cachedInitialStateWallets.length || ((new Date()).getTime() - lastStateWalletTime) < 1e3) {
            return;
        }

        logger.debug("1s has passed since the last stateWallet update. Beginning batch-processing.");

        // fixme: addCachedStateWallet calls are asynchronous, but mergedInitialStateWallet depends on the order of
        //        elements in cachedInitialStateWallet for properly detecting orphaned or reorganised transactions. In
        //        practice this shouldn't be a huge issue because the window for this to happen is very small.
        const mergedInitialStateWallet: StateWallet = merge(...cachedInitialStateWallets);
        cachedInitialStateWallets = [];
        lastStateWalletTime = undefined;
        commit('setWalletState', mergedInitialStateWallet);
    },

    addCachedStateWallet({commit, dispatch}, initialStateWallet: StateWallet) {
        // Call maybeDoStateWallet every second.
        if (!hasStartedCachedStateWalletWatcher) {
            hasStartedCachedStateWalletWatcher = true;
            setInterval(() => dispatch('maybeDoStateWallet'), 300);
        }

        logger.silly("Adding more items to the initialStateWallet cache...");
        cachedInitialStateWallets.push(initialStateWallet);
        lastStateWalletTime = (new Date()).getTime();
    },

    // We're called by stateWallet (in initialize).
    setWalletState({dispatch, rootGetters}, initialStateWallet: StateWallet) {
        logger.silly('setWalletState');
        dispatch('addCachedStateWallet', initialStateWallet);
    },

    handleTransactionEvent({dispatch, rootGetters}, transactionEvent: TransactionEvent) {
        logger.silly('handleTransactionEvent');
        dispatch('addCachedStateWallet', {addresses: transactionEvent});
    },
    
    handleAddressEvent({dispatch, rootGetters}, addressEvent: AddressEvent) {
        logger.silly('handleAddressEvent');
        dispatch('addCachedStateWallet', addressEvent)
    },

    changeLockStatus({commit, rootGetters}, uniqIds: string[]) {
        logger.info('changeLockStatus');
        commit('setLockState', uniqIds)
    },

    changeHasMnemonic({commit, rootGetters}, hasM: boolean) {
        commit('setHasMnemonic', hasM);
    },

    changeShouldShowWarning({commit, rootGetters}, warning: boolean) {
        commit('setShouldShowWarning', warning);
    },

    setAddressBook({commit, rootGetters}, addressBook_: AddressBookItem[]) {
        commit('setAddressBook', addressBook_);
    },

    setPaymentCodes({commit, rootGetters}, pcs: PaymentCodeItem[]) {
        commit('setPaymentCodes', pcs);
    },

    setPaymentChannels({commit, rootGetters}, channels: PaymentChannel[][]) {
        commit('setPaymentChannels', channels);
    },

    deleteAddressItem({commit, rootGetters}, address:string) {
        commit('deleteAddressItem', address);
    },

    addAddressItem({commit, rootGetters}, item:AddressBookItem) {
        commit('addAddressItem', item);
    }
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from zcoind
    transactions: (state) => state.transactions,
    unspentUTXOs: (state) => state.unspentUTXOs,
    addressBook: (state) => state.addressBook,
    walletLoaded: (state) => state.walletLoaded,
    paymentCodes: (state) => state.paymentCodes,
    paymentChannels: (state) => state.paymentChannels,
    unusedAddresses: (state) => state.unusedAddresses,

    // a map of addresses to a list of `${txid}-${txIndex}` associated with the address
    addresses: (state) => state.addresses,

    getZnodeRewardsReceivedAtAddress: (state) => {
        return (address) => (state.addresses[address] || [])
            .map(uniqId => state.transactions[uniqId])
            .filter(tx => tx.category === 'znode')
            .reduce((a,tx) => a + tx.amount, 0);
    },

    // a map of blockHeights to {totalMintAmount: number, blockTime: number}, where totalMintAmount is the total amount
    // minted in that block and blockTime is the blockTime of the block.
    consolidatedMints: (state) => {
        // This is recalculated every time state.transactions is updated instead of being cached because the blockHeight
        // a given transaction is in is not necessarily constant (ie. in the event of a reoganization), which means it's
        // easier to redo the calculations every time than to look for that case and then invalidate the cache
        // selectively.

        const consolidatedMints = {};

        for (const tx of Object.values(state.transactions) as TransactionOutput[]) {
            if (tx.category !== 'mint') {
                continue;
            }

            const block = tx.blockHeight || 0;

            if (!consolidatedMints[block]) {
                consolidatedMints[block] = {
                    totalMintAmount: 0,
                    blockTime: tx.blockTime,
                    mints: []
                };
            }

            consolidatedMints[block].mints.push(tx);
            consolidatedMints[block].totalMintAmount += tx.amount;
        }

        return consolidatedMints;
    },

    mintsInProgress (state, getters, rootState, rootGetters) {
        const currentBlockHeight = rootGetters['Blockchain/currentBlockHeight'];
        return Object.values(<{[id: string]: TransactionOutput}>getters['transactions'])
            .filter(tx => tx.category === 'mint' && (!tx.blockHeight || currentBlockHeight - tx.blockHeight < 5))
            .map((tx) => {
                return {
                    confirmations: tx.blockHeight ? currentBlockHeight - tx.blockHeight + 1 : 0,
                    amount: tx.amount,
                    id: tx.uniqId,
                }
            })
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};