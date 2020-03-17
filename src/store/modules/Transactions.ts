import { createLogger } from '../../lib/logger';

const logger = createLogger('zcoin:store:Transactions');

// one transaction output, of which a transaction may have many.
interface TransactionOutput {
    // A unique ID generated on our side (not present in the API) which identifies the transaction. It will be different
    // for outgoing and incoming versions of the same
    // transactions.
    uniqId: string;

    category: string;
    txid: string;
    txIndex: number;
    firstSeenAt: number;
    label: string;
    fee: number;
    amount: number;
    address?: string;
    blockHeight?: number;
    blockHash?: number;
    blockTime?: number;
    spendable: boolean;
    locked: boolean;
}

interface TransactionInput {
    txid: string;
    index: number;
}

interface AddressBookItem {
    address: string;
    label: string;
    purpose: string;
}

// This is the data format for initial/stateWallet.
interface StateWallet {
    addresses: {
        // maybeAddress could also be the string "MINT"
        [maybeAddress: string]: {
            txids: {
                [grouping: string]: {
                    [maybeTxid: string]: TransactionOutput
                }
            },
            inputs?: {
                [outpoint: string]: TransactionInput
            },
            lockedcoins?: {
                [outpoint: string]: TransactionInput
            },
    
            unlockedcoins?: {
                [outpoint: string]: TransactionInput
            },
        }    
    }
}

// This is the data format we're given in 'transaction' events.
interface TransactionEvent {
    // maybeAddress could also be the string "MINT"
    [maybeAddress: string]: {
        txids: {
            [grouping: string]: {
                [txid: string]: TransactionOutput
            }
        },

        inputs?: {
            [outpoint: string]: TransactionInput
        },

        lockedcoins?: {
            [outpoint: string]: TransactionInput
        },

        unlockedcoins?: {
            [outpoint: string]: TransactionInput
        },

        total: {
            [txCategory: string]: {
                send?: number;
                mint?: number;
                spend?: number;
                mined?: number;
                znode?: number;
                receive?: number;
            }
        }
    }
}

// This is the data format we're given in 'address' events.
type AddressEvent = StateWallet;

const state = {
    transactions: <{[txidAndIndex: string]: TransactionOutput}>{},
    // values are keys of transactions in state.transactions associated with the address
    addresses: <{[address: string]: string[]}>{},
    unspentUTXOs: <{[txidAndIndex:string]:boolean}>{},
    addressBook: <{[address: string]: AddressBookItem}>{}
};

const mutations = {
    // isReindexing is state.getters['ApiStatus/isReindexing']. The caller must be responsible for it due to inherent
    // limitations in VueX.
    setWalletState(state, {isReindexing, initialStateWallet}: {isReindexing: boolean, initialStateWallet: StateWallet}) {
        logger.info("Setting wallet state: %d addresses", Object.keys(initialStateWallet.addresses).length);
        var unspentAlreadyProcess = false;
        //console.log('ListSpent:', initialStateWallet.listspent);
        for (const address of Object.keys(initialStateWallet.addresses)) {
            const addressData = initialStateWallet.addresses[address];
            if (!['inputs', 'lockedcoins', 'unlockedcoins'].includes(address)) {
                unspentAlreadyProcess = true;
                for (const transactions of Object.values(addressData.txids)) {
                    for (const tx of Object.values(transactions)) {
                        // If we're reindexing, ignore transactions which don't have a blockHeight set. These sort of
                        // transactions should occur only during reindex, and they'll later be sent out with Transaction
                        // events when block data is associated with them again.
                        if (isReindexing && !tx.blockHeight) {
                            logger.warn(`Ignoring transaction ${tx} with no block data received during sync.`);
                            continue;
                        }

                        state.unspentUTXOs[`${tx.txid}-${tx.txIndex}-${tx.category}`] = true;

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
                            if (state.transactions[tx.uniqId]) {
                                logger.info(`Got orphan ${tx.uniqId}, deleting associated records.`);
                                delete state.transactions[tx.uniqId];
                                delete state.unspentUTXOs[tx.uniqId];
                                state.addresses[tx.address] = state.addresses[tx.address].filter(id => id !== tx.uniqId);
                            }

                            // We don't want to display orphan transactions in the UI.
                            continue;
                        }

                        state.transactions[tx.uniqId] = tx;

                        // Mint transactions will have no associated address.
                        if (!tx.address) {
                            continue;
                        }

                        if (!state.addresses[tx.address]) {
                            state.addresses[tx.address] = [];
                        }
                        state.addresses[tx.address].push(tx.uniqId);
                    }
                }
            } else if (['lockedcoins'].includes(address)) {
                for (const outpoint of Object.values(addressData)) {
                    for (const [id, tx] of Object.entries(state.transactions)) {
                        if (id.includes(`${outpoint.txid}-${outpoint.index}-`)) {
                            state.transactions[id].locked = true;
                        }
                    }
                }
            } else if (['unlockedcoins'].includes(address)) {
                for (const outpoint of Object.values(addressData)) {
                    for (const [id, tx] of Object.entries(state.transactions)) {
                        if (id.includes(`${outpoint.txid}-${outpoint.index}-`)) {
                            state.transactions[id].locked = false;
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
                        state.transactions[id].spendable = false;
                        state.unspentUTXOs[id] = false;
                        delete state.unspentUTXOs[id];
                    }
                }
            }
        }
        // Tell Vue we've updated our variables.
        // FIXME: Use Vue.set.
        state.addresses = {...state.addresses};
        state.transactions = {...state.transactions};
        state.unspentUTXOs = {...state.unspentUTXOs};
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
        })
        state.addressBook = {...state.addressBook};
    }
};

const actions = {
    // We're called by stateWallet (in initialize).
    setWalletState({commit, rootGetters}, initialStateWallet: StateWallet) {
        logger.info('setWalletState');
        const isReindexing = rootGetters['ApiStatus/isReindexing'];
        commit('setWalletState', {isReindexing, initialStateWallet});
    },

    handleTransactionEvent({commit, rootGetters}, transactionEvent: TransactionEvent) {
        console.log('handleTransactionEvent:', transactionEvent);
        logger.info('handleTransactionEvent');
        commit('setWalletState', {isReindexing: false, initialStateWallet: {addresses: transactionEvent}});
    },
    
    handleAddressEvent({commit, rootGetters}, addressEvent: AddressEvent) {
        logger.info('handleAddressEvent');
        commit('setWalletState', {isReindexing: false, initialStateWallet: addressEvent})
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
    }
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from zcoind
    transactions: (state) => state.transactions,
    unspentUTXOs: (state) => state.unspentUTXOs,
    addressBook: (state) => state.addressBook,

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