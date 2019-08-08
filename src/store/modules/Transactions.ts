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
    // values are keys of transactions in state.transactions associated with the address
    addresses: <{[address: string]: string[]}>{}
};

const mutations = {
    setStateWithInitialStateWallet(state, initialStateWallet: StateWallet) {
        logger.info("Populating initial wallet state...");

        const newStateTransactions = {};
        const newStateAddresses = {};
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

                    // Mint transactions will have no associated address.
                    if (!tx.address) {
                        continue;
                    }

                    if (!newStateAddresses[tx.address]) {
                        newStateAddresses[tx.address] = [];
                    }
                    newStateAddresses[tx.address].push(`${tx.txid}-${tx.txIndex}`);
                }
            }
        }
        state.addresses = newStateAddresses;
        state.transactions = newStateTransactions;
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