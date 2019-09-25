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
            }
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
    addresses: <{[address: string]: string[]}>{}
};

const mutations = {
    setWalletState(state, initialStateWallet: StateWallet) {
        logger.info("Setting wallet state: %d addresses", Object.keys(initialStateWallet.addresses).length);

        for (const address of Object.keys(initialStateWallet.addresses)) {
            const addressData = initialStateWallet.addresses[address];

            for (const transactions of Object.values(addressData.txids)) {
                for (const tx of Object.values(transactions)) {
                    if (tx.category === 'orphan') {
                        // Orphan category transactions are only sent for mined transactions, when they leave the main
                        // chain.
                        let uniqId = `${tx.txid}-${tx.txIndex}-mined`;

                        // Delete previous records associated with the transaction.
                        if (state.transactions[uniqId]) {
                            logger.info(`Got orphan ${tx.txid}-${tx.txIndex}, deleting associated records.`);
                            delete state.transactions[uniqId];
                            state.addresses[tx.address] = state.addresses[tx.address].filter(id => id !== uniqId);
                        } else {
                            logger.warn(`Got orphan ${tx.txid}-${tx.txIndex}, but no previous records were associated with it.`)
                        }

                        continue;
                    }

                    if (address === 'MINT' && tx.category === 'receive') {
                        // Every mint transaction appears both as a 'receive' and a 'mint'. Since we're already
                        // processing them as a 'mint' category transaction, we don't need to process it as a 'receive'
                        // category one.
                        continue;
                    }

                    tx.uniqId = `${tx.txid}-${tx.txIndex}-${tx.category}`;

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
        }

        // Tell Vue we've updated our variables.
        // FIXME: Use Vue.set.
        state.addresses = {...state.addresses};
        state.transactions = {...state.transactions};
    }
};

const actions = {
    // We're called by stateWallet (in initialize).
    setWalletState({commit}, initialStateWallet: StateWallet) {
        commit('setWalletState', initialStateWallet);
    },

    handleTransactionEvent({commit}, transactionEvent: TransactionEvent) {
        logger.info('handleTransactionEvent');
        commit('setWalletState', {addresses: transactionEvent});
    },

    handleAddressEvent({commit}, addressEvent: AddressEvent) {
        logger.info('handleAddressEvent');
        commit('setWalletState', addressEvent)
    }
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from zcoind
    transactions: (state) => state.transactions,

    // a map of addresses to a list of `${txid}-${txIndex}` associated with the address
    addresses: (state) => state.addresses,

    getAmountReceivedViaAddress: (state) => {
        return (address) => (state.addresses[address] || [])
            .map(uniqId => state.transactions[uniqId])
            .filter(tx => ['spendIn', 'receive', 'mined', 'znode'].includes(tx.category))
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