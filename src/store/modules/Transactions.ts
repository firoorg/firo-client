import {cloneDeep, merge} from 'lodash';
import {StateWallet, TransactionOutput, TransactionEvent, AddressBookItem, CoinControl} from '../../daemon/firod';
import Vue from "vue";
import { createLogger } from '../../lib/logger'
const logger = createLogger('firo:store:Transactions');

// This is the data format we're given in 'address' events.
type AddressEvent = StateWallet;

const state = {
    transactions: <{[uniqId: string]: TransactionOutput}>{},
    // values are keys of transactions in state.transactions associated with the address
    addresses: <{[address: string]: string[]}>{},
    unspentUTXOs: <{[uniqId: string]: number}>{},
    addressBook: <{[address: string]: AddressBookItem}>{},
    walletLoaded: false
};

const mutations = {
    setWalletState(state, initialStateWallet: StateWallet) {
        const stateTransactions = cloneDeep(state.transactions);
        const stateAddresses = cloneDeep(state.addresses);
        const stateUnspentUTXOs = cloneDeep(state.unspentUTXOs);

        logger.info("Setting wallet state: %d addresses", Object.keys(initialStateWallet.addresses).length);
        var unspentAlreadyProcess = false;
        for (const address of Object.keys(initialStateWallet.addresses)) {
            const addressData = initialStateWallet.addresses[address];
            if (!['inputs', 'lockedCoins', 'unlockedCoins'].includes(address)) {
                unspentAlreadyProcess = true;
                for (const transactions of Object.values(addressData.txids)) {
                    for (const tx of Object.values(transactions)) {
                        tx.uniqId = `${tx.txid}-${tx.txIndex}-${tx.category}`;

                        if (!tx.amount) {
                            logger.warn(`Got 0 amount transaction ${tx.uniqId}`);
                        }

                        if (tx.category === 'orphan' || tx.spendableAt === undefined || tx.spendableAt === -1) {
                            delete stateUnspentUTXOs[tx.uniqId];
                        } else {
                            stateUnspentUTXOs[tx.uniqId] = tx.spendableAt;
                        }

                        if (tx.category === 'orphan') {
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
                        delete stateUnspentUTXOs[id];
                    }
                }
            }
        }

        // Mints to ourselves are listed twice. Filter them out here.
        for (const uniqId of Object.keys(stateTransactions)) {
            if (uniqId.includes('-mintIn')) {
                const mintId = uniqId.replace('-mintIn', '-mint');
                if (stateTransactions[mintId]) {
                    delete stateTransactions[uniqId];
                    delete stateUnspentUTXOs[uniqId];

                    stateTransactions[mintId].isChange = true;
                }
            }

            if (uniqId.includes('-mint')) {
                const receiveId = uniqId.replace('-mint', '-receive');
                if (stateTransactions[receiveId]) {
                    delete stateTransactions[receiveId];
                    delete stateUnspentUTXOs[receiveId];
                }


                const spendInId = uniqId.replace('-mint', '-receive');
                if (stateTransactions[spendInId]) {
                    delete stateTransactions[spendInId];
                    delete stateUnspentUTXOs[spendInId];
                }
            }
        }

        state.addresses = stateAddresses;
        state.transactions = stateTransactions;
        state.unspentUTXOs = stateUnspentUTXOs;
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

    markSpentTransaction(state, inputs: CoinControl) {
        for (const uniqId of Object.keys(state.transactions).filter(k => inputs.find(i => k.includes(`${i[0]}-${i[1]}`)))) {
            logger.debug(`Marking txout ${uniqId} as used.`);
            delete state.unspentUTXOs[uniqId];
        }
    },

    markLockedTransaction(state, {txout: [txid, txIndex], locked}) {
        for (const tx of <TransactionOutput[]>Object.values(state.transactions)) {
            if (tx.txid === txid && tx.txIndex == txIndex) {
                Vue.set(tx, 'locked', locked);
            }
        }
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
        const mergedInitialStateWallet: StateWallet = merge([], ...cachedInitialStateWallets);
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
    }
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from firod
    transactions: (state) => state.transactions,
    availableUTXOs: (state, getters, rootState, rootGetters) =>
        Object.keys(state.unspentUTXOs)
        .map(uniqId => {
            const tx = state.transactions[uniqId];
            if (!tx) console.warn(`Unknown transaction ${uniqId} in unspentUTXOs`);
            return tx;
        })
        .filter(tx => rootGetters['App/allowBreakingMasternodes'] || !tx.locked)
        .filter(tx => tx && tx.spendableAt >= 0 && tx.spendableAt <= rootGetters['ApiStatus/currentBlockHeight'] + 1),
    addressBook: (state) => state.addressBook,
    walletLoaded: (state) => state.walletLoaded,
    lockedTransactions: (state) => Object.values(state.transactions).filter((tx: TransactionOutput) => tx.locked),
    // a map of addresses to a list of `${txid}-${txIndex}` associated with the address
    addresses: (state) => state.addresses,

    getZnodeRewardsReceivedAtAddress: (state) => {
        return (address) => (state.addresses[address] || [])
            .map(uniqId => state.transactions[uniqId])
            .filter(tx => tx.category === 'znode')
            .reduce((a,tx) => a + tx.amount, 0);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
