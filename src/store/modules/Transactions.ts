class Block {
    readonly hash: string;
    readonly height: number;
    readonly isOrphan: boolean;
    // UNIX time in seconds
    readonly time: number;

    constructor(hash: string, height: number, time: number, isOrphan: boolean) {
        this.hash = hash;
        this.height = height;
        this.time = time;
        this.isOrphan = isOrphan;
    }

    // Create a transaction from a JSON object representing a transaction sent by zcoind.
    static fromTxObj(txObj: {block: {hash: string, height: number, time: number} | null, status: string}): Block | null {
        const b = txObj.block;
        if (!b) { return null; }

        return new Block(b.hash, b.height, b.time,txObj.status === "orphan")
    }
}

enum TransactionOutputType {
    Outgoing = 'outgoing',
    Incoming = 'incoming',
    Mint = 'mint'
}

// one transaction output, of which a transaction may have many.
class TransactionOutput {
    // is this an outgoing, incoming, or mint transaction?
    readonly transactionType: TransactionOutputType;
    // the destination address of the transaction output. This will be null if this is a mint transaction
    readonly address: string | null;
    // the value of the transaction, in satoshi.
    readonly amount: number;
    // the transaction ID associated with this output. Note that a number of TransactionOutputs may share the same txId.
    readonly txId: string;
    // this is a unique ID identifying this transaction output, and its directionality. If a transaction is sent to
    // ourselves, the incoming and outgoing version will have different ids.
    readonly id: string;
    // the block the transaction was included in. Note that this is NOT guaranteed to be constant for a given
    // transaction. (This might happen during a chain reorganisation, for example.) This value will be null if the
    // transactions has not yet been included in a block.
    readonly block: Block | null;
    // the label associated with the transaction.
    readonly label: String | null;

    // The caller is responsible that id is entirely unique. This is not checked anywhere else.
    constructor(transactionType: TransactionOutputType, address: string | null, amount: number, txId: string,
                id: string, block: Block | null, label: String | null) {
        this.transactionType = transactionType;
        this.address = address;
        this.amount = amount;
        this.txId = txId;
        this.id = id;
        this.block = block;
        this.label = label;
    }
}

const getters = {
    // a list of all the transactions we've made, include incoming, outgoing, and mints.
    transactions(state, getters, rootState, rootGetters): TransactionOutput[] {
        // This method presents a more sane interface than the legacy ones. It'll be refactored to replace those at a
        // later point.

        // the actual list of transactions we're going to return. All the other references to transactions in this
        // function refer to different things, confusingly.
        const retval = [];

        const walletAddresses = rootGetters['Address/walletAddresses'];
        const outgoingTransactions = rootGetters['Address/getOutgoingTransactions'];
        const allMints = rootGetters['Mint/allMints'];
        const paymentRequestsList = rootGetters['PaymentRequest/allPaymentRequests'];

        const paymentRequestLabels = new Map();
        for (const pr of paymentRequestsList) {
            paymentRequestLabels.set(pr.address, pr.label)
        }

        for (const addr of walletAddresses) {
            const label = paymentRequestLabels.get(addr.address) || null;

            for (const tx of addr.transactions) {
                retval.push(new TransactionOutput(
                    TransactionOutputType.Incoming,
                    addr.address,
                    tx.amount,
                    tx.txid,
                    `${tx.id}-incoming`,
                    Block.fromTxObj(tx),
                    label
                ));
            }
        }

        for (const tx of outgoingTransactions) {
            retval.push(new TransactionOutput(
                TransactionOutputType.Outgoing,
                tx.belongsToAddress,
                tx.amount,
                tx.txid,
                `${tx.id}-outgoing`,
                Block.fromTxObj(tx),
                tx.label || null
            ));
        }

        for (const tx of allMints) {
            retval.push(new TransactionOutput(
               TransactionOutputType.Mint,
               null,
               tx.amount,
               tx.txid,
               `${tx.id}-mint`,
               Block.fromTxObj(tx),
                '#Zerocoin Mint'
            ));
        }

        return retval
    }
};

export default {
    namespaced: true,
    state: {},
    mutations: {},
    actions: {},
    getters
};