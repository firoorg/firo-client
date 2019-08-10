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
    // values are keys of transactions in state.transactions associated with the address
    addresses: <{[address: string]: string[]}>{}
};

const mutations = {
    setWalletState(state, initialStateWallet: StateWallet) {
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
    setStateWithInitialStateWallet({commit}, initialStateWallet: StateWallet) {
        commit('setStateWithInitialStateWallet', initialStateWallet);
    }
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from zcoind
    transactions: (state) => state.transactions,

    // a map of addresses to a list of `${txid}-${txIndex}` associated with the address
    addresses: (state) => state.addresses
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};