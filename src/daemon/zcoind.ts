import * as fs from "fs";
import * as zmq from "zeromq";
import * as path from "path";
import Mutex from "await-mutex";

import * as constants from './constants';
import { createLogger } from '../lib/logger';

const logger = createLogger('zcoin:daemon');

interface ApiStatus {
    data: {
        myZnode: any, // TODO: What are allowed values here?
        version: number;
        protocolVersion: number;
        walletVersion: number;
        walletLock: boolean;
        dataDir: string;
        network: string;
        blocks: number;
        connections: number;
        devAuth: boolean;
        synced: boolean;
        pid: number;
        modules: {
            [moduleName: string]: boolean;
        }
    };
    meta: {
        status: number;
    };
    error: string | null;
}

type PaymentRequestState = 'active' | 'hidden' | 'deleted' | 'archived';

interface PaymentRequestData {
    address: string;
    createdAt: number;
    amount: number;
    label: string;
    message: string;
    state: PaymentRequestState;
}

// Read a certificate pair from path. Returns [pubKey, privKey]. Throws if path does not exist or is not a valid key
// file.
function readCert(path: string): [string, string] {
    const parsed = JSON.parse(fs.readFileSync(path).toString());

    if (
        parsed.type !== "keys" ||
        !parsed.data ||
        typeof parsed.data.public !== 'string' ||
        typeof parsed.data.private !== 'string'
    ) {
        throw "invalid certificate file: " + path;
    }

    return [parsed.data.public, parsed.data.private];
}

// Daemon takes care of sending messages to the daemon and receiving subscription events.
export class Zcoind {
    private statusPublisherSocket: zmq.Socket;
    // (requester|publisher)Socket will be undefined prior to the invocation of gotStatus
    private requesterSocket: zmq.Socket | undefined;
    private publisherSocket: zmq.Socket | undefined;
    private hasReceivedApiStatus: boolean;
    private requestMutex: Mutex;
    // This is the unlocking function for requestMutex which will be called after we are connected. This is required so
    // that send() will block prior to connecting to the proper socket.
    private _unlockAfterConnect: Promise<() => void>;
    private eventHandlers: {[eventName: string]: (daemon: Zcoind, eventData: any) => Promise<void>};

    // We will automatically register for all the eventNames in eventHandler, except for 'apiStatus', which is a special
    // key that will be called when an apiStatus event is receives.
    constructor(eventHandlers: {[eventName: string]: (daemon: Zcoind, eventData: any) => Promise<void>}) {
        this.hasReceivedApiStatus = false;
        this.requestMutex = new Mutex();
        // This will resolve instantly, but we don't want to let in a potential race condition by making it assign after
        // the Promise is resolved.
        this._unlockAfterConnect = this.requestMutex.lock();
        this.eventHandlers = eventHandlers;
    }

    // Connect to the daemon and take action when it serves us appropriate events.
    connectAndReact() {
        this.statusPublisherSocket = zmq.socket('sub');
        // Set timeout for requester socket
        this.statusPublisherSocket.setsockopt(zmq.ZMQ_RCVTIMEO, 2000);
        this.statusPublisherSocket.setsockopt(zmq.ZMQ_SNDTIMEO, 2000);

        this.statusPublisherSocket.connect(`tcp://${constants.zcoindAddress.host}:${constants.zcoindAddress.statusPort.publisher}`);

        this.statusPublisherSocket.subscribe('apiStatus');
        this.statusPublisherSocket.on('message', (topic, msg) => {
            this.gotApiStatus(msg.toString());
        });
    }

    // This function is called when the API status is received. It initialises the (separate) sockets by which we'll
    // send and receive data from zcoind.
    private gotApiStatus(apiStatusMessage: string) {
        let apiStatus: ApiStatus;
        try {
            apiStatus = JSON.parse(apiStatusMessage);
        } catch (e) {
            logger.error("Failed to parse API status %O", apiStatusMessage);
            throw "Failed to parse API status";
        }

        if (apiStatus.error) {
            logger.error("Error retrieving API status: %O", apiStatus);
            throw "Error retrieving API status";
        }

        if (apiStatus.meta.status < 200 || apiStatus.meta.status >= 400) {
            logger.error("Retrieved API status with bad status %d: %O", apiStatus.meta.status, apiStatus);
            throw "Bad API status";
        }

        if (!this.hasReceivedApiStatus) {
            this.hasReceivedApiStatus = true;
            this.initializeWithApiStatus(apiStatus);
        }

        if (this.eventHandlers['apiStatus']) {
            this.eventHandlers['apiStatus'](this, apiStatus);
        }
    }

    // This function contains the logic for connecting to proper sockets, registering for events, etc. that are required
    // before initialization.
    private initializeWithApiStatus(apiStatus: ApiStatus) {
        logger.info("Initializing with apiStatus: %O", apiStatus);

        this.requesterSocket = zmq.socket('req');
        this.publisherSocket = zmq.socket('sub');

        // Set timeout for requester socket
        this.requesterSocket.setsockopt(zmq.ZMQ_RCVTIMEO, 2000);
        this.requesterSocket.setsockopt(zmq.ZMQ_SNDTIMEO, 2000);

        let reqPort, pubPort;
        switch (apiStatus.data.network) {
            case 'regtest':
                reqPort = constants.zcoindAddress.regtestPort.request;
                pubPort = constants.zcoindAddress.regtestPort.publisher;
                break;

            case 'main':
                reqPort = constants.zcoindAddress.mainPort.request;
                pubPort = constants.zcoindAddress.mainPort.publisher;
                break;

            case 'test':
                reqPort = constants.zcoindAddress.testPort.request;
                pubPort = constants.zcoindAddress.testPort.publisher;
                break;

            default:
                logger.error("Connected to unknown network type %O", apiStatus.data.network);
                throw 'connected to unknown network type';
        }

        const [clientPubkey, clientPrivkey] = readCert(path.join(apiStatus.data.dataDir, "certificates", "client", "keys.json"));
        const serverPubkey = readCert(path.join(apiStatus.data.dataDir, "certificates", "server", "keys.json"))[0];

        // Setup encryption.
        for (const s of [this.requesterSocket, this.publisherSocket]) {
            s.curve_serverkey = serverPubkey;
            s.curve_publickey = clientPubkey;
            s.curve_secretkey = clientPrivkey;
        }

        this.requesterSocket.connect(`tcp://${constants.zcoindAddress.host}:${reqPort}`);
        this.publisherSocket.connect(`tcp://${constants.zcoindAddress.host}:${pubPort}`);

        logger.info("Connected to zcoind");

        // Subscribe to all events for which we've been given a handler.
        for (const topic of Object.keys(this.eventHandlers)) {
            // apiStatus is a special key that's not actually associated with an event of that name.
            if (topic === 'apiStatus') {
                continue;
            }

            logger.debug("Subscribing to %O events", topic);
            this.publisherSocket.subscribe(topic);
        }

        this.publisherSocket.on('message', (topicBuffer, messageBuffer) => {
            this.handleSubscriptionEvent(topicBuffer.toString(), messageBuffer.toString());
        });

        // We can send now, so release the initial lock on this.requestMutex().
        this._unlockAfterConnect.then(f => f());
    }

    // We're called when a subscription event from zcoind comes up. In turn, we call the relevant subscription handlers
    // that have been set in registerSubscriptionHandler and log appropriately.
    private handleSubscriptionEvent(topic: string, message: string) {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch(e) {
            logger.error("zcoind sent us invalid JSON data on a subscription for %s: %O", topic, message);
            return;
        }

        logger.debug("zcoind sent us a subscription event for topic %s: %O", topic, parsedMessage);

        if (parsedMessage.meta.status !== 200) {
            logger.error("zcoind sent us an event for topic %s with a non-200 status: %O", topic, parsedMessage);
        }

        if (this.eventHandlers[topic]) {
            this.eventHandlers[topic](this, parsedMessage.data);
        } else {
            logger.warn("Received subscription event with topic '%s', but no handler exists.", topic);
        }
    }

    // Send a request to zcoind. Basically a given API call is identified by *both* the type and collection parameters.
    // auth is the wallet password, which is only required for certain calls. data is arbitrary data associated with the
    // call. We return a Promise containing the data object of the response we got from zcoind.
    //
    // The Promise will be reject()ed in the case that zcoind gives invalid JSON data, responds with an error, or
    // responds with no data object; or if we fail to send to zcoind. If zcoind gives invalid JSON data, or we fail to
    // send, we reject() with the exception object. If zcoind responds with an error or responds with no data object, we
    // return the entire response object we received from zcoind.
    async send(auth: string | null, type: string, collection: string, data: object): Promise<any> {
        logger.debug("Trying to acquire requestMutex for %s/%s call", type, collection);
        // We can't have multiple requests pending simultaneously because there is no guarantee that replies come back
        // in order, and also no tag information allowing us to associate a given request to a reply.
        let release = await this.requestMutex.lock();
        logger.debug("Acquired requestMutex");

        return new Promise((resolve, reject) => {
            try {
                logger.debug("Sending request to zcoind: type: %O, collection: %O, data: %O", type, collection, data);
                this.requesterSocket.send(JSON.stringify({
                    auth: {
                        passphrase: auth
                    },
                    type,
                    collection,
                    data
                }));
            } catch (e) {
                logger.error("Error sending data to zcoind: %O", e);
                reject(e);
                release();
                return;
            }

            this.requesterSocket.once('message', (messageBuffer) => {
                const messageString = messageBuffer.toString();

                let message;
                try {
                    message = JSON.parse(messageString);
                } catch (e) {
                    logger.error("zcoind sent us invalid JSON: %O", messageString);
                    release();
                    reject(e);
                    return;
                }

                logger.debug("received reply from zcoind: %O", message);

                if (typeof message === 'object' &&
                    !message.error &&
                    message.meta &&
                    message.meta.status === 200 &&
                    message.data
                ) {
                    resolve(message.data);
                } else {
                    logger.error("zcoind replied with an error: %O", message);
                    reject(message);
                }

                release();
            });
        });
    }



    // Actions

    // Invoke a legacy RPC command. result is whatever the JSON result of the command is, and errored is a boolean that
    // indicates whether or not an error has occurred.
    //
    // Note: legacyRpc commands sometimes require auth, but they take it as a special legacyRpc command
    //       (walletpassphrase) which is called prior to invoking the protected command.
    async legacyRpc(commandline: string): Promise<{result: object, errored: boolean}> {
        // Yes, it is correct to infer that zcoind can parse the argument list but cannot parse the command name.
        const i = commandline.indexOf(' ');
        const method = (i !== -1) ? commandline.slice(0, i) : commandline;
        const args = (i !== -1) ? commandline.slice(i+1) : '';

        return await this.send(null, 'create', 'rpc', {
            method,
            args
        });
    }

    // Returns a list of all available legacy RPC commands.
    async legacyRpcCommands(): Promise<string[]> {
        // I don't exactly understand why TypeScript infers the incorrect types for stuff here, given that this.send()
        // returns a Promise of any, but ...
        const r = await this.send(null, 'initial', 'rpc', {});
        const categories = Object.values(r.categories);
        const helpEntries = <string[]>categories.reduce((a: string[], x: string[]) => a.concat(x), []);
        const commands = helpEntries.map(x => x.split(' ')[0]);

        return commands;
    }

    // Create a new payment request (to be stored on the daemon-side).
    // Note: zcoind doesn't send out a subscription event when a new payment request is created, so the caller is
    // responsible for any updating of state that might be required.
    async createPaymentRequest(amount: number | undefined, label: string, message: string): Promise<PaymentRequestData> {
        return await this.send(null, 'create', 'paymentRequest', {
            amount,
            label,
            message
        });
    }

    // Update an existing payment request.
    // Note: zcoind doesn't send out a subscription event when a payment request is updated, so the caller is
    // responsible for any updating of state that might be required.
    async updatePaymentRequest(address: string, amount: number | undefined, label: string, message: string, state: PaymentRequestState): Promise<PaymentRequestData> {
        return await this.send(null, 'update', 'paymentRequest', {
            id: address,
            amount,
            label,
            message,
            state
        });
    }

    // Publicly send amount satoshi XZC to recipient. resolve()s with txid, or reject()s if we have insufficient funds
    // or the call fails for some other reason.
    async publicSend(auth: string, label: string, recipient: string, amount: number, feePerKb: number): Promise<string> {
        const data: {txid: string} = await this.send(auth, 'create', 'sendZcoin', {
            addresses: {
                [recipient]: {
                    label,
                    amount
                }
            },
            feePerKb
        });

        return data.txid;
    }

    // Publicly send amount satoshi XZC to recipient. resolve()s with txid, or reject()s if we have insufficient funds
    // or the call fails for some other reason.
    async privateSend(auth: string, label: string, recipient: string, amount: number): Promise<string> {
        const data = await this.send(auth, 'create', 'sendPrivate', {
            outputs: [
                {
                    address: recipient,
                    amount
                }
            ],
            label
        });

        return data;
    }

    // Mint Zerocoins in the given denominations. zerocoinDenomination must be one of '0.05', '0.1', '0.5', '1', '10',
    // '25', or '100'; values are how many to mint of each type. (e.g. passing mints: {'100': 2} will mint 200
    // Zerocoin). We resolve() with the generated txid, or reject() with an error if something went wrong.
    async mintZerocoin(auth: string, mints: {[zerocoinDenomination: string]: number}): Promise<string> {
        return await this.send(auth, 'create', 'mint', {
            denominations: mints
        });
    }

    // Calculate a transaction fee. addresses is a map of {recipient: satoshiAmount} pairs; feePerKb is the satoshi
    // fee per kilobyte for the generated transaction. We reject() the promise if the zcoind call fails or received data
    // is invalid.
    async calcTxFee(feePerKb: number, addresses: Record<string, number>): Promise<number> {
        let data = await this.send(null, 'get', 'txFee', {
            addresses,
            feePerKb
        });

        if (typeof data.fee === 'number') {
            return data.fee;
        } else {
            logger.error("got invalid calcTxFee response: %O", data);
            throw "got invalid calcTxFee response";
        }
    }

    // Backup wallet.dat into backupDirectory. We will reject() the problem if the backup fails for some reason;
    // otherwise we return void.
    async backup(backupDirectory: string): Promise<void> {
        await this.send(null, 'create', 'backup', {directory: backupDirectory});
    }
}