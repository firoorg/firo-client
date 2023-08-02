import * as fs from "fs";
import * as zmq from "zeromq";
import * as path from "path";
import {validateMnemonic} from "bip39";
const {execFile} = require("child_process");
import Mutex from "await-mutex";
import EventWaitHandle from "./eventWaitHandle";

import * as constants from './constants';
import * as net from "net";


export const bigIntTransform = (_, x) =>
    (
        x &&
        typeof x === 'object' &&
        typeof x.bigint === 'string' &&
        Object.keys(x).length == 1 &&
        isFinite(x.bigint)
    ) ? BigInt(x.bigint) : x;
export const bigIntSerializeTransform = (_, x) => typeof x === 'bigint' ? `${x}` : x;

// The base class for all our errors.
export class FirodError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export interface StandardFirodRequest {
     auth: null | {
         passphrase: string;
     };
     type: string;
     collection: string;
     data: unknown;
}

function isStandardFirodRequest(x): x is StandardFirodRequest {
    return x !== null &&
        typeof x === 'object' &&
        x.auth !== null &&
        typeof x.auth === 'object' &&
        (x.auth.passphrase === null || typeof x.auth.passphrase === 'string') &&
        (typeof x.type === 'string' || x.type === null) &&
        typeof x.collection === 'string';
}

export interface FirodResponseMessage {
    data: unknown;
    meta: {
        status: number;
    };
    error: null | {
        code: number,
        message: string;
    }
}

function isFirodResponseMessage(x: any): x is FirodResponseMessage {
    return x !== null &&
        typeof x === 'object' &&
        x.meta !== null &&
        typeof x.meta === 'object' &&
        typeof x.meta.status === 'number' &&
        (
            (x.error === null && x.data !== undefined) ||
            (
                x.data === null &&
                x.error !== null &&
                typeof x.error === 'object' &&
                typeof x.error.code === 'number' &&
                typeof x.error.message === 'string'
            )
        );
}

export interface FirodErrorResponseMessage {
    data: null;
    meta: {
        status: number;
    };
    error: {
        code: number;
        message: string;
    }
}

function isFirodErrorResponseMessage(x: any): x is FirodErrorResponseMessage {
    return isFirodResponseMessage(x) && (x.error !== null);
}

export class FirodErrorResponse extends FirodError {
    call: string;
    error: FirodErrorResponseMessage;
    errorMessage: string;
    errorCode: number;

    constructor(call: string, error: FirodErrorResponseMessage) {
        super(`${call} call failed (${error.error.code}): ${error.error.message}`);
        this.name = 'FirodErrorResponse';
        this.call = call;
        this.error = error;
        this.errorMessage = error.error.message;
        this.errorCode = error.error.code;
    }
}

export class UnexpectedFirodResponse extends FirodError {
    response: unknown;
    call: string;

    constructor(call: string, response: unknown) {
        super(`unexpected response to call ${call}`);
        this.name = 'UnexpectedFirodResponse';
        this.call = call;
        this.response = response;

        console.error(`Unexpected response to call ${call}: ${JSON.stringify(response, bigIntSerializeTransform)}`);
    }
}

export class IncorrectPassphrase extends FirodError {
    call: string;

    constructor(call: string) {
        super(`incorrect passphrase for ${call} call`);
        this.name = 'IncorrectPassphrase';
        this.call = call;
    }
}

// This is thrown when connecting to firod takes too long. It probably indicates that firod is already running.
export class FirodConnectionTimeout extends FirodError {
    constructor(seconds: number) {
        super(`unable to connect to firod within ${seconds}s; a reason this might happen is that you have another instance of firod not managed by Firo Client running or if firod was not built with --enable-clientapi passed to ./configure`);
        this.name = 'FirodConnectionTimeout';
    }
}

// This is thrown when we find a firod instance already listening when we haven't yet started one.
export class FirodAlreadyRunning extends FirodError {
    constructor() {
        super('Another firod instance running with -clientapi=1 is already running');
        this.name = 'FirodAlreadyRunning';
    }
}

export class FirodAlreadyShutdown extends FirodError {
    constructor() {
        super('firod has already been shutdown');
        this.name = 'FirodAlreadyShutdown';
    }
}

export type Network = 'mainnet' | 'regtest' | 'regtest-ql' | 'test';
export class InvalidNetwork extends FirodError {
    constructor() {
        super("valid network types are 'mainnet', 'regtest', 'reqtest-ql', and 'test'");
        this.name = 'InvalidNetwork';
    }
}
function assertValidNetwork(x: any): x is Network {
    if (!['mainnet', 'regtest', 'regtest-ql', 'test'].includes(x)) {
        throw new InvalidNetwork();
    }

    return true;
}

export interface ApiStatusData {
    version: number;
    protocolVersion: number;
    walletVersion: number;
    walletLock: boolean;
    disabledSporks: string[],
    dataDir: string;
    // Note that this is DIFFERENT from the Network type.
    network: 'main' | 'test' | 'regtest' | 'regtest-ql';
    blocks: number;
    connections: number;
    devAuth: boolean;
    synced: boolean;
    pid: number;
    reindexing: boolean;
    rescanning: boolean;
    reindexingProgress?: number;
    modules: {
        [moduleName: string]: boolean;
    };
    Znode?: {
        localCount: number;
        totalCount: number;
        enabledCount: number;
    };
    hasMnemonic: boolean;
    smartFeePerKb: bigint;
    hasSentInitialStateWallet: boolean;
    latestBlockTimestamp: number;
    newLogMessages: string[];
    isSpark: boolean;
    lelantusGracefulPeriod: number;
}

export interface ApiStatus {
    data: ApiStatusData;
    meta: {
        status: number;
    };
    error: string | null;
}

export interface TxOut {
    scriptType: 'pay-to-public-key' | 'pay-to-public-key-hash' | 'pay-to-script-hash' | 'pay-to-witness-script-hash' |
        'zerocoin-mint' | 'zerocoin-remint' | 'zerocoin-spend' | 'sigma-spend' | 'sigma-mint' | 'lelantus-mint' |
        'lelantus-jmint' | 'lelantus-joinsplit' | 'elysium' | 'spark-mint'| 'spark-smint' | 'spark-spend' | 'unknown';
    amount: bigint;
    isChange: boolean;
    isLocked: boolean;
    isSpent: boolean;
    isToMe: boolean;
    isElysiumReferenceOutput: boolean;
    destination?: string;
    lelantusSerialHash?: string;
    sparkInputLTagHashes?: string;
}

type ElysiumPropertyLelantusStatus = "SoftDisabled" | "SoftEnabled" | "HardDisabled" | "HardEnabled";
export interface ElysiumPropertyData {
    id: number;
    issuer: string;
    creationTx: string;
    isDivisible: boolean;
    ecosystem: "main" | "test";
    isFixed: boolean;
    isManaged: boolean;
    lelantusStatus: ElysiumPropertyLelantusStatus;
    name: string;
    category: string;
    subcategory: string;
    data: string;
    url: string;
}

type ElysiumTransactionType = "Simple Send" | "Restricted Send" | "Send All" | "Savings" | "Savings COMPROMISED" |
    "Rate-Limiting" | "Automatic Dispensary" | "Create Property - Fixed" | "Create Property - Variable" |
    "Create Property - Manual" | "Grant Property Tokens" | "Revoke Property Tokens" | "Change Issuer Address" |
    "Enable Freezing" | "Disable Freezing" | "Freeze Property Tokens" | "Unfreeze Property Tokens" | "Notification" |
    "ALERT" | "Feature Deactivation" | "Feature Activation" | "Lelantus Mint" | "Lelantus JoinSplit" |
    "Change Lelantus Status" | "* unknown type *";
export interface ElysiumData {
    isToMe: boolean;
    sender: string;
    receiver: string;
    type: ElysiumTransactionType;
    version: number;
    valid: boolean;
    // This will be present only the transaction is confirmed and not valid.
    invalidReason?: string;
    amount?: bigint;
    // This will only be present on Lelantus JoinSplit transactions. Its value is the change amount minted. It will be
    // -1 if there was an error retrieving the relevant data; that shouldn't normally happen.
    joinmintAmount?: bigint;
    property?: ElysiumPropertyData;
}

export interface Transaction {
    txid: string;
    inputType: 'public' | 'mined' | 'zerocoin' | 'sigma' | 'lelantus' | 'sparkmint' | 'sparkspend';
    isFromMe: boolean;
    firstSeenAt: number;
    fee: bigint;
    outputs: TxOut[];
    publicInputs: CoinControl;
    lelantusInputSerialHashes: string[];
    sparkInputLTagHashes: string[];
    elysium?: ElysiumData;

    // blockHash MAY be set without blockHeight or blockTime, in which case the transaction is from an orphaned block.
    // If inputType is not 'mined', the transaction should be included at a later date, unless it's been double spent.
    // Therefore, you should check for whether a transaction has been included or not be seeing whether blockHeight is
    // set, not blockHash.
    blockHash?: string;
    blockHeight?: number;
    blockTime?: number;

    isInstantSendLocked: boolean;
}

export interface TransactionInput {
    txid: string;
    index: number;
}

export interface AddressBookItem {
    addressType: string;
    address: string;
    label: string;
    createdAt?: number; // UNIX timestamp in milliseconds
    purpose: 'send' | 'receive';
}

function isValidAddressBookItem(x: any): x is AddressBookItem {
    const r = x !== null &&
        typeof x === 'object' &&
        typeof x.addressType === 'string' &&
        typeof x.address === 'string' &&
        typeof x.label === 'string' &&
        typeof x.purpose === 'string';

    return r;
}

export interface MasternodeEvent {
    proTxHash: string;
    collateralHash: string;
    collateralIndex: Number;
    collateralAddress: string;
    operatorReward: number;
    state: {
        status: string;
        service: string;
        registeredHeight: number;
        lastPaidHeight: number;
        nextPaymentHeight: number;
        PoSePenalty: number;
        PoSeRevivedHeight: number;
        PoSeBanHeight: number;
        revocationReason: number;
        ownerAddress: string;
        votingAddress: string;
        payoutAddress: string;
        pubKeyOperator: string;
        operatorPayoutAddress: string;
    },
    wallet: {
        hasMasternode: boolean;
        hasOperatorKey: boolean;
        hasOwnerKey: boolean;
        hasVotingKey: boolean;
        ownsCollateral: boolean;
        ownsOperatorRewardScript: boolean;
        ownsPayeeScript: boolean;
    }
}

export type PaymentRequestState = 'active' | 'hidden' | 'deleted' | 'archived';
export interface PaymentRequestData {
    address: string;
    createdAt: number;
    amount: number;
    label: string;
    message: string;
    state: PaymentRequestState;
}

export class InvalidMnemonic extends FirodError {
    constructor(message) {
        super(message);
        this.name = 'InvalidMnemonic';
    }
}

export {validateMnemonic, generateMnemonic} from "bip39";
export type MnemonicSettings = {mnemonic: string, mnemonicPassphrase: string | null, isNewMnemonic: boolean};
function assertValidMnemonicSettings(x: any): x is MnemonicSettings {
    if (x !== null &&
        typeof x === 'object' &&
        typeof x.mnemonic === 'string' &&
        (
            x.mnemonicPassphrase === null ||
            typeof x.mnemonicPassphrase === 'string'
        ) &&
        typeof x.isNewMnemonic === 'boolean') {

        if (validateMnemonic(x.mnemonic)) {
            return true;
        } else {
            throw new InvalidMnemonic('mnemonic is not a valid BIP39 mnemonic');
        }
    } else {
        throw new InvalidMnemonic('mnemonic object is not valid');
    }
}

// CoinControl is an array of [txid, txindex] pairs.
export type CoinControl = [string, number][];
const coinControlToString = (coinControl?: CoinControl) => (coinControl || []).map(e => `${e[0]}-${e[1]}`).join(':');
function isValidCoinControl(x: any): x is CoinControl {
    if (typeof x !== 'object') return false;
    for (const ix in x) {
        if (typeof x[ix] !== 'object' ||
            typeof x[ix][0] !== 'string' ||
            typeof x[ix][1] !== 'number'
        ) return false;
    }
    return true;
}

export type Setting = {
    data: string;
    changed: boolean;
    disabled: boolean;
};
export type SettingsData = {
    [key: string]: Setting | boolean;
};

// This verifies not just that the x matches the interface, but that for all keys, iff key begins with a "-" it is a
// Setting, and otherwise it is a boolean.
function isValidSettingsData(x: any): x is SettingsData {
    if (x === null || typeof x !== 'object') {
        return false;
    }

    for (const [k, v] of <any>Object.entries(x)) {
        if (v === null ||
            !(
                (!k.startsWith("-") && typeof v === 'boolean') ||
                (
                    k.startsWith("-") &&
                    typeof v === 'object' &&
                    v.hasOwnProperty('data') &&
                    typeof v.changed === 'boolean' &&
                    typeof v.disabled === 'boolean'
                )
            )
        ) {
            return false;
        }
    }

    return true;
}

export class FirodDoesNotExist extends FirodError {
    path: string;

    constructor(path: string) {
        super(`firod at path ${path} does not exist`);
        this.name = 'FirodDoesNotExist';
    }
}

export class InvalidCertificateFile extends FirodError {
    path: string;

    constructor(path: string) {
        super(`invalid certificate file: ${path}`);
        this.name = 'InvalidCertificateFile';
        this.path = path;
    }
}

// Read a certificate pair from path. Returns [pubKey, privKey]. Throws if path does not exist or is not a valid key
// file.
function readCert(path: string): [string, string] {
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(path).toString(), bigIntTransform);
    } catch(e) {
        throw new InvalidCertificateFile(path);
    }

    if (
        parsed !== null &&
        typeof parsed === 'object' &&
        parsed.type === "keys" &&
        parsed.data !== null &&
        typeof parsed.data === 'object' &&
        typeof parsed.data.public === 'string' &&
        typeof parsed.data.private === 'string'
    ) {
        return [parsed.data.public, parsed.data.private];
    }

    throw new InvalidCertificateFile(path);
}

export type FirodEventHandler = (daemon: Firod, eventData: unknown) => Promise<void>;
export type FirodInitializationFunction = (daemon: Firod) => Promise<void>;

export class FirodStartupError extends FirodError {
    error: Error;
    stderr: string;

    constructor(error: Error, stderr: string) {
        super(`error starting firod (${error}): ${stderr}`);
        this.name = 'FirodStartupError';
        this.error = error;
        this.stderr = stderr;
    }
}

export class RebroadcastError extends FirodError {
    error: string;

    constructor(error: string) {
        super(`error rebroadcasting transaction: ${error}`);
        this.name = 'RebroadcastError';
        this.error = error;
    }
}

export class ZnodeStartupError extends FirodError {
    error: string;

    constructor(error: string) {
        super(`failed to start znode: ${error}`);
        this.name = 'ZnodeStartupError';
        this.error = error;
    }
}

// We take care of starting the daemon, sending messages, and calling proper event handlers for subscription events.
export class Firod {
    // These are synchronisation primitives so as to not send data before firod is ready.
    private gotAPIResponseEWH: EventWaitHandle<undefined>;
    private apiIsReadyEWH: EventWaitHandle<undefined>;
    private blockchainLoadedEWH: EventWaitHandle<undefined>;
    private hasConnectedEWH: EventWaitHandle<undefined>;
    private initializersCompletedEWH: EventWaitHandle<undefined>;
    private blockchainSyncedEWH: EventWaitHandle<undefined>;
    // We resolve with true if firod has shutdown cleanly or false if it has crashed.
    private firodHasShutdown: EventWaitHandle<boolean>

    // This will ensure only one request is sent at a time.
    private requestMutex: Mutex;
    // This is to ensure start() is only called once.
    private hasStarted: boolean = false;
    // This is to make sure that send() won't be called after we're shutdown.
    private hasShutdown: boolean = false;

    // (requester|publisher)Socket will be undefined prior to the apiIsReadyEWH being released.
    private requesterSocket?: zmq.Request;
    private publisherSocket?: zmq.Subscriber;
    private statusPublisherSocket: zmq.Subscriber;

    // latestApiStatus will be reset every time we get an apiStatus. It will be undefined until we get an apiStatus.
    private latestApiStatus?: ApiStatus;

    // These are the user-provided event handlers that will be called when firod receives events.
    private readonly eventHandlers: {[eventName: string]: (daemon: Firod, eventData: any) => Promise<void>};
    // These are the functions that will be called after awaitApiIsReady() resolves.
    private readonly initializers: FirodInitializationFunction[];
    // This is the network we will tell firod to connect to.
    readonly firodNetwork: Network;
    // The location of the firod binary, or null to use the default location.
    readonly firodLocation: string | null;
    // The directory that firod will use to store its data. This must already exist.
    readonly firodDataDir: string;

    // If this is set to true, we will connect to an existing firod instance (supposing -clientapi is enabled) instead
    // of resetting everything. In this case, initializers will NOT be run (unless runInitializersIfFirodIsRunning is
    // set).
    allowMultipleFirodInstances: boolean = false;
    // If this is set to true, when we connect to a running firod instance, we WILL run initializers.
    runInitializersIfFirodIsRunning: boolean = false;
    // If this is set to true, we will try to kill an existing firod process with the same data directory.
    killOldFirod: boolean = false;
    // This is the number of seconds to wait before signalling firod as unresponsive.
    connectionTimeout: number = 30;
    // Extra arguments to be passed to firod
    extraFirodArgs: string[] = [];
    // The process ID firod is running as. undefined if firod is not yet started.
    pid?: number;
    // This is used to prevent us JSON-encoding large subscription events when it's unnecessary.
    logSubscriptionEvents: boolean = process.env.LOG == "debug";

    // firodLocation is the location of the firod binary.
    //
    // network is the network firod should connect to.
    //
    // If firodDataDir is null (but NOT undefined or the empty string) we will not specify it and use the default
    // location.
    //
    // All the functions in initializers will be called with firod as their only argument after awaitApiIsReady()
    // resolves. When all of them resolve() (or reject()), awaitInitializersCompleted() will resolve.
    //
    // We will automatically register for all the eventNames in eventHandler, except for 'apiStatus', which is a special
    // key that will be called when an apiStatus event is receives.
    constructor(network: Network, firodLocation: string, firodDataDir: string | null,
                initializers: FirodInitializationFunction[], eventHandlers: {[eventName: string]: FirodEventHandler}) {
        assertValidNetwork(network);
        this.firodNetwork = network;
        this.firodLocation = firodLocation;
        this.firodDataDir = firodDataDir;

        this.initializers = initializers;
        this.eventHandlers = eventHandlers;

        this.requestMutex = new Mutex();
        this.gotAPIResponseEWH = new EventWaitHandle();
        this.apiIsReadyEWH = new EventWaitHandle();
        this.blockchainLoadedEWH = new EventWaitHandle();
        this.hasConnectedEWH = new EventWaitHandle();
        this.initializersCompletedEWH = new EventWaitHandle();
        this.blockchainSyncedEWH = new EventWaitHandle();
        this.firodHasShutdown = new EventWaitHandle();
    }

    // Start the daemon and register handlers.
    //
    // If mnemonicSettings is set, we start up the daemon with the directive to initialize it with the given mnemonic
    // and passphrase. These are not passed in the constructor because we don't want to pass them again if we restart.
    // wallet.dat MUST NOT exist if this option is passed; we will check for it and throw if it does.
    //
    // If firod is already listening, we will reject().
    //
    // We may be called only once.
    async start(mnemonicSettings?: MnemonicSettings) {
        if (this.hasStarted) {
            throw new FirodAlreadyRunning();
        }
        this.hasStarted = true;

        let datadir;
        switch (this.firodNetwork) {
            case "mainnet":
                datadir = path.join(this.firodDataDir);
                break;

            case "test":
                datadir = path.join(this.firodDataDir, "testnet3");
                break;

            case "regtest-ql":
                datadir = path.join(this.firodDataDir, "regtest-ql");
                break

            case "regtest":
                datadir = path.join(this.firodDataDir, "regtest");
                break

            default:
                throw new InvalidNetwork();
        }

        if (mnemonicSettings) {
            assertValidMnemonicSettings(mnemonicSettings);

            const walletLocation = path.join(datadir, "wallet.dat");
            if (fs.existsSync(walletLocation)) {
                throw new InvalidMnemonic("Firod.start() called with mnemonicSettings set, but wallet.dat already exists");
            }
        }

        if (this.killOldFirod) {
            const pidFile = path.join(datadir, "firod.pid");
            console.info(`Attempting to read old firo pid from ${pidFile}`);

            let pidFileContent: string;
            try {
                pidFileContent = await fs.promises.readFile(pidFile, "ascii");
            } catch (e) {
                if (e?.code != 'ENOENT')
                    throw new FirodError(`Error reading ${pidFile}: ${e}`);
            }

            let oldPid;
            if (pidFileContent) oldPid = Number(pidFileContent.trim());
            else console.debug("No pid file found.");

            if (pidFileContent && !oldPid) {
                console.info(`Old pid ${pidFileContent} is not a number, ignoring`);
            } else if (oldPid) {
                console.info(`Found old process ${oldPid}, attempting to kill it...`);

                try {
                    process.kill(oldPid);
                } catch (e) {
                    if (e?.code == 'ESRCH')
                        console.info(`Old process ${oldPid} not found, continuing`);
                    else if (e?.code == 'EPERM')
                        console.info(`We don't have permission to kill old process ${oldPid}`);
                    else
                        throw new FirodError(`Error killing old process ${oldPid}: ${e}`);
                }

                for (let i = 0; i < 180; i++) {
                    try {
                        process.kill(oldPid, 0);
                    } catch (e) {
                        if (e?.code == 'ESRCH')
                            break;
                    }

                    if (i == 39)
                        throw new FirodError(`Old process ${oldPid} is still running after 45 seconds`);

                    await new Promise(r => setTimeout(r, 250));
                }
            }
        }

        // There is potential for a race condition here, but it's hard to fix, only occurs on improper shutdown, and has
        // a fairly small window anyway.
        const isFirodListening = await this.isFirodListening();

        if (isFirodListening && !this.allowMultipleFirodInstances) {
            throw new FirodAlreadyRunning();
        }

        if (!isFirodListening) {
            await this.launchDaemon(mnemonicSettings);
        }

        if (!isFirodListening || this.runInitializersIfFirodIsRunning) {
            this.awaitHasConnected().then(async () => {
                const initializerPromises = this.initializers.map(initializer => initializer(this));
                const rejections = [];

                for (const promise of initializerPromises) {
                    try {
                        await promise;
                    } catch (e) {
                        rejections.push(e);
                    }
                }

                if (rejections.length > 0) {
                    await this.initializersCompletedEWH.poison(rejections);
                } else {
                    await this.initializersCompletedEWH.release(undefined);
                }
            });
        } else {
            this.awaitHasConnected().then(async () => {
                await this.initializersCompletedEWH.release(undefined);
            });
        }

        await this.connectAndReact();
    }

    // Wait for the firod API to first make a response. This DOES NOT mean that it is safe commands. You must await
    // awaitApiIsReady() for that.
    async awaitApiResponse() {
        await this.gotAPIResponseEWH.block();
    }

    // Resolve when firod has loaded the block index.
    async awaitApiIsReady() {
        await this.apiIsReadyEWH.block()
    }

    // Wait for apiStatus to indicate we are not rescanning or reindexing.
    async awaitBlockchainLoaded() {
        await this.blockchainLoadedEWH.block();
    }

    // Wait for the blockchain to be synced.
    async awaitBlockchainSynced() {
        await this.blockchainSyncedEWH.block();
    }

    // Await connection to the requester socket.
    async awaitHasConnected() {
        await this.hasConnectedEWH.block();
    }

    // We resolve when all our initializers have resolved, or, if any of them have rejected, we wait for all to complete
    // and then reject() with an Array containing all the rejections we received.
    async awaitInitializersCompleted() {
        await this.initializersCompletedEWH.block();
    }

    // Checks if a firod that we have gotten an apiStatus from is running.
    isFirodRunning(): boolean {
        if (!this.pid) throw new FirodError("firod not running");
        try {
            process.kill(this.pid, 0);
            return true;
        } catch (e) {
            return false;
        }
    }

    async awaitFirodStopped(): Promise<void> {
        while (true) {
            if (this.pid && !this.isFirodRunning()) return;
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Resolve when we determine that firod is listening by attempting a connection every 1s.
    async awaitFirodListening() {
        while (true) {
            if (await this.isFirodListening()) {
                break;
            }

            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Await firod shutting down. If the shutdown is clean, we will resolve(); if it is unclean, we will reject().
    async awaitShutdown(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (await this.firodHasShutdown.block()) {
                resolve();
            } else {
                reject();
            }
        });
    }

    // Launch firod at firodLocation as a daemon with the specified datadir dataDir. Resolves when firod exits with
    // status 0, or rejects it with the error given by execFile if something goes wrong.
    //
    // If mnemonicSettings is set, we start up the daemon with the directive to initialize it with the given mnemonic
    // and passphrase.
    private async launchDaemon(mnemonicSettings?: MnemonicSettings): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.firodLocation)) {
                throw new FirodDoesNotExist(this.firodLocation);
            }

            // These are the arguments that will be passed to firod.
            const args = [...this.extraFirodArgs, "-clientapi=1"];

            if (process.platform === "win32") {
                args.push("-daemon=0");
            } else {
                args.push("-daemon=1");
            }

            if (this.firodDataDir) {
                args.push(`-datadir=${this.firodDataDir}`);
            }

            if (mnemonicSettings) {
                assertValidMnemonicSettings(mnemonicSettings);

                if (!mnemonicSettings.isNewMnemonic) {
                    // We need to rescan when recovering from a mnemonic.
                    args.push("-rescan=1");
                }

                args.push("-usemnemonic=1");
                args.push(`-mnemonic=${mnemonicSettings.mnemonic}`);
                if (mnemonicSettings.mnemonicPassphrase) {
                    args.push(`-mnemonicpassphrase=${mnemonicSettings.mnemonicPassphrase}`);
                }
            }

            assertValidNetwork(this.firodNetwork);
            switch (this.firodNetwork) {
                case 'mainnet':
                    args.push("-mainnet=1");
                    break;

                case 'test':
                    args.push("-testnet=1");
                    break;

                case 'regtest':
                    args.push("-regtest=1");
                    args.push("-dandelion=0");
                    break;

                case 'regtest-ql':
                    args.push("-regtest-ql=1");
                    // dandelion=0 needs to be set for mining to actually include transactions on regtest.
                    args.push("-dandelion=0");
                    break;

                default:
                    throw 'unreachable';
            }

            console.info("Starting daemon...");
            if (process.platform === "win32") {
                let hasResolved = false;

                execFile(this.firodLocation, args,{}, (error, stdout, stderr) => {
                    if (hasResolved) return;

                    if (error) {
                        console.error(`Error starting daemon (${error}): ${stderr}`);
                        hasResolved = true;
                        reject(new FirodStartupError(error, stderr));
                    }
                });

                this.awaitFirodListening().then(() => {
                    if (hasResolved) return;

                    console.info("firod is listening. Inferring that we've successfully started the daemon.");
                    hasResolved = true;
                    resolve();
                })
            } else {
                execFile(this.firodLocation,
                    args,
                    {timeout: 10_000},
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error starting daemon (${error}): ${stderr}`);
                            reject(new FirodStartupError(error, stderr));
                        } else {
                            console.info(`Successfully started daemon: ${stdout}`);
                            resolve();
                        }
                    }
                );
            }
        }
       );
    }


    // Determine whether or not someone is listening on host constants.firodAddress.host, port
    // constants.firodAddress.statusPort.publisher.
    isFirodListening(): Promise<boolean> {
        return new Promise(resolve => {
            const socket = new net.Socket();
            socket.setTimeout(this.connectionTimeout * 1000);
            socket.on("error", () => {
                socket.destroy();
                resolve(false);
            });
            socket.on("timeout", () => {
                socket.destroy();
                resolve(false);
            });
            socket.on("connect", () => {
                socket.destroy();
                resolve(true);
            });
            // Yes, the port is given first.
            socket.connect(constants.firodAddress.statusPort.publisher, constants.firodAddress.host);
        });
    }

    // Connect to the daemon and take action when it serves us appropriate events. Resolves when the daemon connection
    // is made successfully. We will continue to try reconnecting to the firod statusPort until a connection is made.
    private async connectAndReact() {
        let finished = false;
        console.info("Waiting for firod to open its ports...");
        // We need to do this because ZMQ will just hang if the socket is unavailable.
        await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (!finished) {
                    console.error(`firod has not opened it ports after ${this.connectionTimeout} seconds`);
                    finished = true;
                }

                reject(new FirodConnectionTimeout(this.connectionTimeout));
            }, this.connectionTimeout * 1000);

            this.awaitFirodListening().then(() => {
                if (!finished) {
                    console.info("firod's ports are open.");
                    finished = true;
                }

                resolve();
            });
        });

        this.awaitFirodStopped().then(async () => {
            // This will be set if firod shutdown cleanly.
            if (this.hasShutdown) {
                console.debug("firod has closed its ports after a clean shutdown");
                return;
            }

            this.hasShutdown = true;
            console.error("firod has died unexpectedly");
            await this.firodHasShutdown.release(false);
        });

        console.info("Connecting to firod...")
        this.statusPublisherSocket = new zmq.Subscriber();

        new Promise(async () => {
            for await (const [topicBuffer, msgBuffer] of this.statusPublisherSocket) {
                try {
                    await this.gotApiStatus(msgBuffer.toString());
                } catch (e) {
                    console.error(e);
                }
            }
        });

        this.statusPublisherSocket.connect(`tcp://${constants.firodAddress.host}:${constants.firodAddress.statusPort.publisher}`);
        this.subscribeToApiStatus();
    }

    // This method is needed because firod may accept the connection but fail to queue or respond to apiStatus
    // subscriptions. (To my knowledge, this occurs when firod is rescanning the block database, which seems to occur
    // after firod has been loaded with the same datadir on a new operating system.)
    //
    // We'll subscribe to apiStatus, and then keep trying to subscribe every 1.5s until we actually get an apiStatus
    // message.
    private subscribeToApiStatus() {
        if (this.latestApiStatus) {
            return;
        }

        try {
            // If it's not ignored, this call is idempotent, and safe even when the socket is not yet open, but will
            // throw if the socket is closed already, which might be the case if we've closed the connection a short
            // time after opening it.
            this.statusPublisherSocket.subscribe('apiStatus');
        } catch(e) {
            if (e.name === "TypeError" && e.message === "Socket is closed") {
                return;
            }

            throw new FirodError(`subscribing to apiStatus failed: ${e}`);
        }

        setTimeout(() => this.subscribeToApiStatus(), 1500);
    }

    // This function is called when the API status is received. It initialises the (separate) sockets by which we'll
    // send and receive data from firod.
    private async gotApiStatus(apiStatusMessage: string) {
        let apiStatus: ApiStatus;
        try {
            apiStatus = JSON.parse(apiStatusMessage, bigIntTransform);
        } catch (e) {
            console.error(`Failed to parse API status "${apiStatusMessage}"`);
            throw new FirodError(`Failed to parse apiStatus: ${e}`);
        }

        if (apiStatus.error) {
            console.error(`Error retrieving API status: ${JSON.stringify(apiStatus, bigIntSerializeTransform)}`);
            throw new UnexpectedFirodResponse('apiStatus', apiStatus);
        }

        if (apiStatus.meta.status < 200 || apiStatus.meta.status >= 400) {
            console.error(`Received API status with bad status ${apiStatus.meta.status}: ${JSON.stringify(apiStatus, bigIntSerializeTransform)}`);
            throw new UnexpectedFirodResponse('apiStatus', apiStatus);
        }

        this.latestApiStatus = apiStatus;
        await this.gotAPIResponseEWH.release(undefined);

        this.pid = apiStatus.data.pid;

        // modules.API will be set once it is valid to connect to the API.
        if (apiStatus.data && apiStatus.data.modules && apiStatus.data.modules.API) {
            // release() returns true if we are the first to lock the release/poison the EventWaitHandle.
            if (await this.apiIsReadyEWH.release(undefined)) {
                try {
                    await this.initializeWithApiStatus(apiStatus);
                } catch (e) {
                    this.apiIsReadyEWH.reset();
                    throw e;
                }
            }
        }

        if (apiStatus.data && apiStatus.data.reindexing === false && apiStatus.data.rescanning === false) {
            await this.blockchainLoadedEWH.release(undefined);
        }

        if (apiStatus.data && apiStatus.data.synced) {
            await this.blockchainSyncedEWH.release(undefined);
        }

        if (this.eventHandlers['apiStatus']) {
            await this.eventHandlers['apiStatus'](this, apiStatus);
        }
    }

    // This function contains the logic for connecting to proper sockets, registering for events, etc. that are required
    // before initialization. It is called after an apiStatus with modules.API set to true is sent. It MUST NOT be
    // called multiple times.
    private async initializeWithApiStatus(apiStatus: ApiStatus) {
        console.info('Received initial apiStatus.');

        this.requesterSocket = new zmq.Request();
        this.publisherSocket = new zmq.Subscriber();


        let reqPort, pubPort;
        switch (apiStatus.data.network) {
            case 'regtest':
            case 'regtest-ql':
                reqPort = constants.firodAddress.regtestPort.request;
                pubPort = constants.firodAddress.regtestPort.publisher;
                break;

            case 'main':
                reqPort = constants.firodAddress.mainPort.request;
                pubPort = constants.firodAddress.mainPort.publisher;
                break;

            case 'test':
                reqPort = constants.firodAddress.testPort.request;
                pubPort = constants.firodAddress.testPort.publisher;
                break;

            default:
                console.error(`Connected to unknown network type ${apiStatus.data.network}`);
                throw new UnexpectedFirodResponse('apiStatus', apiStatus);
        }

        const [clientPubkey, clientPrivkey] = readCert(path.join(apiStatus.data.dataDir, "certificates", "client", "keys.json"));
        const serverPubkey = readCert(path.join(apiStatus.data.dataDir, "certificates", "server", "keys.json"))[0];

        // Setup encryption.
        for (const s of [this.requesterSocket, this.publisherSocket]) {
            s.curveServerKey = serverPubkey;
            s.curvePublicKey = clientPubkey;
            s.curveSecretKey = clientPrivkey;
        }

        console.info("Connecting to firod controller ports...");

        // These calls give no indication of failure.
        this.requesterSocket.connect(`tcp://${constants.firodAddress.host}:${reqPort}`);
        this.publisherSocket.connect(`tcp://${constants.firodAddress.host}:${pubPort}`);

        // Subscribe to all events for which we've been given a handler.
        for (const topic of Object.keys(this.eventHandlers)) {
            // apiStatus is a special key that's not actually associated with an event of that name.
            if (topic === 'apiStatus') {
                continue;
            }

            console.debug(`Subscribing to ${topic} events`);
            this.publisherSocket.subscribe(topic);
        }

        new Promise(async () => {
            for await (const [topicBuffer, messageBuffer] of this.publisherSocket) {
                this.handleSubscriptionEvent(topicBuffer.toString(), messageBuffer.toString());
            }
        });

        await this.hasConnectedEWH.release(undefined);
    }

    // We're called when a subscription event from firod comes up. In turn, we call the relevant subscription handlers
    // that have been set in registerSubscriptionHandler and log appropriately.
    private handleSubscriptionEvent(topic: string, message: string) {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message, bigIntTransform);
        } catch(e) {
            console.error(`firod sent us invalid JSON data on a subscription for ${topic}: ${message}`);
            return;
        }

        if (this.logSubscriptionEvents) {
            console.debug(`firod sent us a subscription event for topic ${topic}:${JSON.stringify(parsedMessage, bigIntSerializeTransform, 2)}`);
        }

        if (parsedMessage.meta.status !== 200) {
            console.error(`firod sent us an event for topic ${topic} with a non-200 status: ${JSON.stringify(parsedMessage, bigIntSerializeTransform)}`);
            return;
        }

        if (this.eventHandlers[topic]) {
            this.eventHandlers[topic](this, parsedMessage.data);
        } else {
            console.warn(`Received subscription event with topic '${topic}', but no handler exists.`);
        }
    }

    // SendPage a request to firod. Basically a given API call is identified by *both* the type and collection parameters.
    // auth is the wallet password, which is only required for certain calls. data is arbitrary data associated with the
    // call. We return a Promise containing the data object of the response we got from firod.
    //
    // The Promise will be reject()ed in the case that firod gives invalid JSON data, responds with an error, or
    // responds with no data object; or if we fail to send to firod. If firod gives invalid JSON data, or we fail to
    // send, we reject() with the exception object. If firod responds with an error or responds with no data object, we
    // return the entire response object we received from firod.
    //
    // If firod has been shutdown intentionally (but not crashed) this method will throw.
    async send(auth: string | null, type: string, collection: string, data: unknown): Promise<unknown> {
        if (collection !== 'rpc') {
            console.debug(`Sending request to firod: type: ${type}, collection: ${collection}, data: ${JSON.stringify(data, bigIntSerializeTransform, 2)}`);
        }

        return await this.requesterSocketSend(Firod.formatSend(auth, type, collection, data));
    }

    private static formatSend(auth: string | null, type: string, collection: string, data: unknown): unknown {
        return {
            auth: {
                passphrase: auth
            },
            type,
            collection,
            data
        };
    }

    // SendPage an object through the requester socket and process the response. Refer to the documentation of send() for
    // what we're actually doing. The reason this method is split off is that the setPassphrase() method is weird and
    // requires a special case.
    //
    // allowAfterShutdown determines whether we are allowed to send after we're marked as having shutdown. This should
    // only be set to true from sendToShutdown().
    private async requesterSocketSend(message: unknown, allowAftersShutdown: boolean = false): Promise<unknown> {
        await this.hasConnectedEWH.block();

        let callName = '<unknown>';
        if (isStandardFirodRequest(message)) {
            callName = message.type ? `${message.type}/${message.collection}` : message.collection;
        }

        console.debug(`Trying to acquire requestMutex for ${callName}...`);
        // We can't have multiple requests pending simultaneously because there is no guarantee that replies come back
        // in order, and also no tag information allowing us to associate a given request to a reply.
        let releaseLock = await this.requestMutex.lock();
        console.debug(`Acquired requestMutex for ${callName}`);

        const release = () => {
            console.debug(`Releasing requestMutex for ${callName}...`)
            releaseLock();
        };

        return new Promise(async (resolve, reject) => {
            if (this.hasShutdown && !allowAftersShutdown) {
                reject(new FirodAlreadyShutdown());
                return;
            }

            try {
                await this.requesterSocket.send(JSON.stringify(message, bigIntSerializeTransform));
            } catch (e) {
                try {
                    await this.sendError(e);
                } finally {
                    release();
                    reject(e);
                }
                return;
            }

            this.requesterSocket.receive().then(([messageBuffer]) => {
                const messageString = messageBuffer.toString();

                let message;
                try {
                    message = JSON.parse(messageString, bigIntTransform);
                } catch (e) {
                    console.error(`firod sent us invalid JSON: ${messageString}`);
                    release();
                    reject(new UnexpectedFirodResponse(callName, e));
                    return;
                }

                if (callName === 'create/rpc' || callName === 'create/showMnemonics') {
                    // Don't log anything about rpc or mnemonic requests.
                } else if (messageString.length > 1024) {
                    console.debug(`received reply from firod for ${callName}: <${messageString.length} bytes>`);
                    console.debug(`content of ${messageString.length} byte reply to ${callName}: ${JSON.stringify(message, bigIntSerializeTransform, 2)}`);
                } else {
                    console.debug(`received reply from firod for ${callName}: ${JSON.stringify(message, bigIntSerializeTransform, 2)}`);
                }

                if (isFirodResponseMessage(message)) {
                    if (message.meta.status === 200) {
                        resolve(message.data);
                    } else if (isFirodErrorResponseMessage(message)) {
                        if (message.error.code === -14) {
                            reject(new IncorrectPassphrase(callName));
                        } else {
                            reject(new FirodErrorResponse(callName, message));
                        }
                    }
                } else {
                    reject(new UnexpectedFirodResponse(callName, message));
                }

                release();
            });
        });
    }

    // Stop the daemon.
    async stopDaemon() {
        await this.sendToShutdown(null, 'initial', 'stop', null);
    }

    // Run a command, knowing that it will result in firod to shut down. If firod is shut down in any other way, it
    // will be considered a crash. This takes the same arguments as send.
    private async sendToShutdown(auth: string | null, type: string, collection: string, data: unknown) {
        if (this.hasShutdown) {
            throw new FirodAlreadyShutdown();
        }

        this.hasShutdown = true;

        await this.requesterSocketSend(Firod.formatSend(auth, type, collection, data), true);

        console.info("Waiting for firod to shutdown.");
        await this.awaitFirodStopped();

        await this.closeSockets();
        await this.firodHasShutdown.release(true);
    }

    // Close our sockets, without stopping the daemon.
    async closeSockets(): Promise<void> {
        if (this.hasShutdown)
            return;

        this.statusPublisherSocket.close();
        this.publisherSocket.close();
        this.requesterSocket.close();

    }

    // This is called when an error sending to firod has occurred.
    async sendError(error: any) {
        console.error(`Error sending data to firod: ${error}`);
    }

    // Actions

    // See stopDaemon() for another available action.

    // See restartDaemon() for another available action.

    // Invoke a legacy RPC command.
    //
    // NOTE: legacyRpc commands sometimes require auth, but they take it as a special legacyRpc command
    //       (walletpassphrase) which is called prior to invoking the protected command.
    async legacyRpc(commandline: string): Promise<{result: null | unknown, error: null | {code: number, message: string}}> {
        // Yes, it is correct to infer that firod can parse the argument list but cannot parse the command name.
        const i = commandline.indexOf(' ');
        const method = (i !== -1) ? commandline.slice(0, i) : commandline;
        const args = (i !== -1) ? commandline.slice(i+1) : '';

        const data = await this.send(null, 'create', 'rpc', {
            method,
            args
        });

        function isLegacyRpcResponse(x: any): x is {result: null | unknown, error: null | {code: number, message: string}} {
            return x !== null &&
                typeof x === 'object' &&
                (
                    (x.error === null) ||
                    (
                        x.result === null &&
                        typeof x.error === 'object' &&
                        typeof x.error.code === 'number' &&
                        typeof x.error.message === 'string'
                    )
                );
        }

        if (isLegacyRpcResponse(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/legacyRpc', data);
        }
    }

    // Returns a list of all available legacy RPC commands.
    async legacyRpcCommands(): Promise<string[]> {
        const data = await this.send(null, 'initial', 'rpc', {});

        function isValidResponse(x: any): x is {categories: {[category: string]: string[]}} {
            if (x === null ||
                typeof x !== 'object' ||
                x.categories === null ||
                typeof x.categories !== 'object') {

                return false;
            }

            for (const v of Object.values(x.categories)) {
                if (!(v instanceof Array) || v.find(e => typeof e !== 'string')) {
                    return false;
                }
            }

            return true;
        }

        if (!isValidResponse(data)) {
            throw new UnexpectedFirodResponse('initial/rpc', data);
        }

        const categories = Object.values(data.categories);
        const helpEntries = categories.reduce((a: string[], x: string[]) => a.concat(x), []);
        return helpEntries.map(x => x.split(' ')[0]);
    }

    // Publicly send amount satoshi XZC to recipient. resolve()s with txid, or reject()s if we have insufficient funds
    // or the call fails for some other reason.
    //
    // If coinControl is specified, it should be a list of [txid, txindex] pairs specifying the inputs to be used for
    // this transaction.
    async publicSend(auth: string, label: string, recipient: string, amount: bigint, feePerKb: bigint,
                     subtractFeeFromAmount: boolean, coinControl?: CoinControl): Promise<{txid: string}> {
        const data = await this.send(auth, 'create', 'sendZcoin', {
            addresses: {
                [recipient]: {
                    label,
                    amount
                }
            },
            feePerKb,
            subtractFeeFromAmount,
            coinControl: {
                selected: coinControlToString(coinControl)
            }
        });

        function isValidResponse(x: any): x is {txid: string} {
            return x !== null && typeof x === 'object' && typeof x.txid === 'string';
        }

        if (isValidResponse(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/sendZcoin', data);
        }
    }

    // Lock the coins in lockedCoins, and unlock the ones in unlockedCoins.
    async updateCoinLocks(auth: string, lockedCoins: CoinControl, unlockedCoins: CoinControl): Promise<boolean> {
        const data = await this.send(auth, 'create', 'lockCoins', {
            lockedCoins: coinControlToString(lockedCoins),
            unlockedCoins: coinControlToString(unlockedCoins)
        });

        if (typeof data === "boolean") {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/lockCoins', data);
        }
    }

    // Send amount satoshi XZC to recipient using Lelantus, optionally subtracting the fee from the amount.
    //
    // If coinControl is specified, it should be a list of [txid, txindex] pairs specifying the inputs to be used for
    // this transaction.
    //
    // resolve()s with the txid and list of , or reject()s if we have insufficient funds or the call fails for some other reason.
    async sendLelantus(auth: string, recipient: string, amount: number, feePerKb: number,
                       subtractFeeFromAmount: boolean, coinControl?: CoinControl): Promise<{txid: string}> {
        const data = await this.send(auth, 'create', 'sendLelantus', {
            recipient,
            amount,
            subtractFeeFromAmount,
            feePerKb,
            coinControl: {
                selected: coinControl ? coinControlToString(coinControl) : ''
            }
        });

        if (typeof data === 'object' && typeof data['txid'] === 'string') {
            return <{txid: string}>data;
        } else {
            throw new UnexpectedFirodResponse('create/sendLelantus', data);
        }
    }

    async showMnemonics(auth: string): Promise<string[]> {
        const data = await this.send(auth, 'create', 'showMnemonics', {});
        if (typeof data === 'string') {
            return data.split(' ');
        }

        throw new UnexpectedFirodResponse('create/showMnemonics', data);
    }

    async getMasternodeList() : Promise<Object> {
        return await this.send('', 'initial', 'masternodeList', {});
    }
    
    async readAddressBook() : Promise<AddressBookItem[]> {
        const data = await this.send('', 'create', 'readAddressBook', {});
        if (data instanceof Array && !data.find(e => !isValidAddressBookItem(e))) {
            return data;
        }

        throw new UnexpectedFirodResponse('create/readAddressBook', data);
    }

    async addAddressBookItem(item: AddressBookItem): Promise<void> {
        await this.send('', 'create', 'editAddressBook', {
            addresstype: item.addressType,
            address: item.address,
            label: item.label,
            purpose: item.purpose,
            action: 'add',
            updatedaddress: '',
            updatedlabel: ''
        });
    }

    async updateAddressBookItem(item: AddressBookItem, newLabel: string) : Promise<AddressBookItem> {
        await this.send('', 'create', 'editAddressBook', {
            addresstype: item.addressType,
            address: item.address,
            label: item.label,
            purpose: item.purpose,
            action: 'edit',
            updatedaddress: item.address,
            updatedlabel: newLabel
        });

        return {
            createdAt: item.createdAt,
            address: item.address,
            purpose: item.purpose,
            label: newLabel,
            addressType: item.addressType,
        };
    }

    async deleteAddressBookItem(item: AddressBookItem) : Promise<void> {
        await this.send('', 'create', 'editAddressBook', {
            address: item.address,
            label: undefined,
            purpose: item.purpose,
            action: 'delete',
            updatedaddress: '',
            updatedlabel: ''
        });
    }

    // Get an unused address with no associated label.
    async getUnusedAddress(addresstype: string = 'Transparent'): Promise<string> {
        const data = await this.send(null, 'none', 'paymentRequestAddress', {addressType: addresstype});

        if (typeof data === 'object' && typeof data['address'] === 'string') {
            return data['address'];
        }

        throw new UnexpectedFirodResponse('none/paymentRequestAddress', data);
    }

    // Turn all of our non-Lelantus coins into Lelantus coins. Should be preferred to mintSigma if Lelantus is
    // available.
    async mintAllLelantus(auth: string): Promise<string[]> {
        const data = await this.send(auth, 'create', 'autoMintLelantus', null);
        if (typeof data !== 'object') throw new UnexpectedFirodResponse('create/mint', data);
        for (const x in data) {
            if (typeof x !== 'string') throw new UnexpectedFirodResponse('create/mint', data);
        }
        return <string[]>data;
    }

    async mintAllSpark(auth: string): Promise<string[]> {
        const data = await this.send(auth, 'create', 'autoMintSpark', null);
        if (typeof data !== 'object') throw new UnexpectedFirodResponse('create/mint', data);
        for (const x in data) {
            if (typeof x !== 'string') throw new UnexpectedFirodResponse('create/mint', data);
        }
        return <string[]>data;
    }
    
    async mintElysium(auth: string, address: string, propertyId: number): Promise<{txids: string[]}> {
        return <any>await this.send(auth, null, 'mintElysium', {
            address,
            propertyId
        });
    }

    async sendElysium(auth: string, propertyId: number, address: string, amount: bigint): Promise<string> {
        return <string | null>await this.send(auth, null, 'sendElysium', {
            address,
            amount,
            propertyId
        });
    }

    async grantElysium(auth: string, propertyId: number, address: string, amount: bigint): Promise<string> {
        return <string | null>await this.send(auth, null, 'grantElysium', {
            propertyId,
            address,
            amount
        });
    }

    // This recovers Elysium-Lelantus mints that were sent by other instances of this mnemonic (e.g. after restoring
    // from a mnemonic).
    async recoverElysium(auth: string) {
        await this.send(auth, null, 'recoverElysium', null);
    }

    // Create an Elysium property, returning the ID of the create property transaction. This will throw if we don't have
    // more than 0.002 public FIRO in a single address.
    async createElysiumProperty(auth: string, fromAddress: string, isFixed: boolean, isDivisible: boolean,
                                amount: string | undefined, name: string, category: string, subcategory: string,
                                data: string, url: string): Promise<{txid: string}> {
        if (!isFixed && amount) throw 'managed properties should not put in an amount';

        return <any>await this.send(auth, null, 'createElysiumProperty', {
            fromAddress,
            isFixed,
            isDivisible,
            amount,
            name,
            category,
            subcategory,
            data,
            url
        });

    }

    // Get information about an Elysium property from its property id or from the tx that created it.
    async getElysiumPropertyInfo(properties: (number | string)[]): Promise<ElysiumPropertyData[]> {
        return <ElysiumPropertyData[]>(await this.send(null, null, 'getElysiumPropertyInfo', {
            propertyIds: properties.filter(p => typeof p == 'number'),
            propertyCreationTxids: properties.filter(p => typeof p == 'string')
        }));
    }

    // calcPublicTxFee and calcPrivateTxFee require an address as input despite the fact that the response is the same
    // regardless of which address is passed. We hardcode them here so that those functions don't have to take a
    // superfluous parameter.
    private defaultAddress(): string {
        switch (this.firodNetwork) {
            case "mainnet":
                // 40 XZC output from block 1.
                return "aEF2p3jepoWF2yRYZjb6EACCP4CaP41doV";

            case "regtest-ql":
            case "regtest":
            case "test":
                // 40 XZC output from testnet block 1. testnet and regtest use the same addresses
                return "TAczBFWtiP8mNstdLn1Z383z51rZ1vHk5N";

            default:
                throw "unreachable";
        }
    }


    // Backup wallet.dat into backupDirectory. We will reject() the problem if the backup fails for some reason;
    // otherwise we return void.
    async backup(backupDirectory: string): Promise<void> {
        await this.send(null, 'create', 'backup', {directory: backupDirectory});
    }

    // Rebroadcast a transaction. If the rebroadcast fails, we reject() the promise with the cause.
    async rebroadcast(txid: string): Promise<void> {
        const data = await this.send(null, 'create', 'rebroadcast', {
            txHash: txid
        });

        function isValidResponse(x: any): x is {result: boolean, error?: string} {
            return x !== null &&
                typeof x === 'object' &&
                typeof x.result === 'boolean' &&
                (
                    (x.result && !x.error) ||
                    !x.result && typeof x.error === 'string'
                );
        }

        if (isValidResponse(data)) {
            if (data.result) {
                return;
            }

            throw new RebroadcastError(data.error);
        } else {
            throw new UnexpectedFirodResponse('create/rebroadcast', data);
        }
    }

    // Change firod settings. If the call fails (e.g. invalid setting names), it will be reject()ed. Note that firod
    // emits no event when settings are changed; the caller of this function should update any required state
    // accordingly.
    async updateSettings(settings: {[key: string]: string}) {
        await this.send(null, 'update', 'setting', settings);
    }

    // Retrieve the value of all settings.
    async getSettings(): Promise<SettingsData> {
        const data = await this.send(null, 'initial', 'setting', null);

        if (isValidSettingsData(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('initial/setting', data);
        }
    }

    // Set the passphrase to newPassphrase. If there is an existing passphrase, it must be passed as oldPassphrase; or
    // else null mast be passed in its stead.
    //
    // We reject() with IncorrectPassphrase if the oldPassphrase is incorrect.
    //
    // If the wallet is unencrypted THE DAEMON WILL STOP; we will wait for it to do so before returning. In this case,
    // any further calls will error.
    async setPassphrase(oldPassphrase: string | null, newPassphrase: string): Promise<void> {
        if (oldPassphrase === null) {
            return await this.sendToShutdown(newPassphrase, 'create', 'setPassphrase', null);
        }

        const r = await this.requesterSocketSend({
            auth: {
                passphrase: oldPassphrase || '',
                newPassphrase
            },
            type: 'update',
            collection: 'setPassphrase',
            data: {}
        });

        if (!r) {
            throw 'setPassphrase call failed';
        }
    }

    // Returns a list of all our transactions.
    async getStateWallet(): Promise<Transaction[]> {
        return <Transaction[]>await this.send(null, 'initial', 'stateWallet', null);
    }

    // Return the API status, waiting until one is available to return.
    async apiStatus(): Promise<ApiStatus> {
        await this.awaitApiResponse();

        return this.latestApiStatus;
    }

    // Has our wallet been locked yet?
    async isWalletLocked(): Promise<boolean> {
        await this.awaitApiIsReady();
        return this.latestApiStatus.data.walletLock;
    }

    // Is the daemon rescanning?
    async isRescanning(): Promise<boolean> {
        return (await this.apiStatus()).data.rescanning;
    }

    // Is the daemon reindexing?
    async isReindexing(): Promise<boolean> {
        return (await this.apiStatus()).data.reindexing;
    }

    // Are Lelantus mints allowed?
    async isLelantusAllowed(): Promise<boolean> {
        const d = (await this.apiStatus()).data;
        return d.disabledSporks && !d.disabledSporks.includes("lelantus");
    }

    async isSparkAllowed(): Promise<boolean> {
        const d = (await this.apiStatus()).data;
        return d.isSpark;
    }

    async mintSpark(auth: string, label: string, recipient: string, amount: number, feePerKb: number,
        subtractFeeFromAmount: boolean, coinControl?: CoinControl): Promise<{txids: string[]}> {
        const data = await this.send(auth, 'create', 'mintSpark', {
        label,
        recipient,
        amount,
        subtractFeeFromAmount,
        feePerKb,
        coinControl: {
            selected: coinControlToString(coinControl)
        }
        });
        function isValidResponse(x: any): x is {txids: string[]} {
            if (x === null ||
                typeof x !== 'object') {
                return false;
            }
            for (const v of x.txids) {
                if (typeof v !== 'string') {
                    return false;
                }
            }
            return true;
        }
        if (isValidResponse(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/mintSpark', data);
        }
    }

    async spendSpark(auth: string, label: string, recipient: string, amount: number, feePerKb: number,
        subtractFeeFromAmount: boolean, coinControl?: CoinControl): Promise<{txid: string}> {
        const data = await this.send(auth, 'create', 'spendSpark', {
        label,
        recipient,
        amount,
        subtractFeeFromAmount,
        feePerKb,
        coinControl: {
            selected: coinControlToString(coinControl)
        }
        });
        function isValidResponse(x: any): x is {txid: string} {
            return x !== null && typeof x === 'object' && typeof x.txid === 'string';
        }
        if (isValidResponse(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/spendSpark', data);
        }
    }

    async lelantusToSpark(auth: string) {
        await this.send(auth, 'create', 'lelantusToSpark', {});
    }

    async validateSparkAddress(address: string): Promise<{valid: boolean}> {
        const data = await this.send('', 'create', 'validateSparkAddress', {address});
        function isValidResponse(x: any): x is {valid: boolean} {
            return x !== null && typeof x === 'object' && typeof x.valid === 'boolean';
        }
        if (isValidResponse(data)) {
            return data;
        } else {
            throw new UnexpectedFirodResponse('create/validateSparkAddress', data);
        }
    }
}
