import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:store:Transactions');

enum TransactionOutputType {
    Mined = 'mined',
    Mint = 'mint',
    Receive = 'receive',
    Send = 'send'
}

// one transaction output, of which a transaction may have many.
interface TransactionOutput {
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

const state = {
    transactions: <{[txidAndIndex: string]: TransactionOutput}>{},
};

const mutations = {
    setStateWithInitialStateWallet(state, initialStateWallet: StateWallet) {
        logger.info("Populating initial wallet state...");

        const newStateTransactions = {};
        for (const address of Object.keys(initialStateWallet.addresses)) {
            const addressData = initialStateWallet.addresses[address];

            for (const transactions of Object.values(addressData.txids)) {
                for (const tx of Object.values(transactions)) {
                    if (address === 'MINT' && tx.category === 'receive') {
                        // Every mint transaction appears both as a 'receive' and a 'mint'. Since we're already
                        // processing them as a 'mint' category transaction, we don't need to process it as a 'receive'
                        // category one.
                        continue;
                    }

                    newStateTransactions[`${tx.txid}-${tx.txIndex}`] = tx;
                }
            }
        }
        state.transactions = newStateTransactions;
    }
};

const actions = {
    setStateWithInitialStateWallet({commit}, initialStateWallet: StateWallet) {
        commit('setStateWithInitialStateWallet', initialStateWallet);
    }
};

const getters = {
    // a list of all the transactions we've made, include incoming, outgoing, and mints.
    transactions: (state) => state.transactions
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};