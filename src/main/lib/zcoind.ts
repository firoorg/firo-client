import * as fs from "fs";
import * as zmq from "zeromq";
import * as path from "path";

import * as constants from '../config/constants';
import { createLogger } from '../../../src/lib/logger';

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
    // Vuex global store
    private store: any;
    private statusPublisherSocket: zmq.Socket;
    // (requester|publisher)Socket will be undefined prior to the invocation of gotStatus
    private requesterSocket: zmq.Socket | undefined;
    private publisherSocket: zmq.Socket | undefined;
    private hasReceivedApiStatus: boolean;

    // store is our global Vuex store.
    constructor(store: any) {
        this.store = store;
        this.hasReceivedApiStatus = false;
    }

    // Connect to the daemon and take action when it serves us appropriate events.
    connectedAndReact() {
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

        this.onApiStatus(apiStatus);
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

        // Subscribe to all events for which we've implemented a handler.
        for (const methodName of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            let topic = (methodName.match(/^on(.+)SubscriptionEvent$/) || [])[1];
            if (!topic) {
                continue;
            }
            // Method names are of the form "onFooSubscriptionEvent", but event names are lowercase.
            topic = topic[0].toLowerCase() + topic.slice(1);

            logger.debug("Subscribing to %O events", topic);
            this.publisherSocket.subscribe(topic);
        }

        this.publisherSocket.on('message', (topicBuffer, messageBuffer) => {
            this.handleSubscriptionEvent(topicBuffer.toString(), messageBuffer.toString());
        });
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

        let handler = `on${topic[0].toUpperCase()}${topic.slice(1)}SubscriptionEvent`;
        if (this[handler]) {
            this[handler](parsedMessage);
        } else {
            logger.warn("Received subscription event with topic '%s', but no handler exists.", topic);
        }
    }


    // Subscription Event Handlers
    //
    // Every handler defined here with the correct name format (/^on(.+)SubscriptionEvent$/) will automatically be
    // subscribed to on startup (in gotApiStatus()) and called when the corresponding event is generated (from
    // handleSubscriptionEvent()). (The event name used is the uncapitalized version of the capturing group in the
    // preceding regexp).


    // This function contains apiStatus-handling logic not related to initialization, which will be called every time
    // an apiStatus event is received, not just on initialization.
    async onApiStatus(event: ApiStatus): Promise<void> {
    }
}