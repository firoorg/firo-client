import * as fs from "fs";
import * as zmq from "zeromq";
import * as path from "path";
import {validateMnemonic} from "bip39";
const {execFile} = require("child_process");
import Mutex from "await-mutex";
import EventWaitHandle from "./eventWaitHandle";

import * as constants from './constants';
import { createLogger } from '../lib/logger';
import * as net from "net";

const logger = createLogger('zcoin:daemon');

// The base class for all our errors.
export class ZcoindError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export interface StandardZcoindRequest {
     auth: null | {
         passphrase: string;
     };
     type: string;
     collection: string;
     data: unknown;
}

function isStandardZcoindRequest(x): x is StandardZcoindRequest {
    return x !== null &&
        typeof x === 'object' &&
        x.auth !== null &&
        typeof x.auth === 'object' &&
        (x.auth.passphrase === null || typeof x.auth.passphrase === 'string') &&
        typeof x.type === 'string' &&
        typeof x.collection === 'string';
}

export interface ZcoindResponseMessage {
    data: unknown;
    meta: {
        status: number;
    };
    error: null | {
        code: number,
        message: string;
    }
}

function isZcoindResponseMessage(x: any): x is ZcoindResponseMessage {
    return x !== null &&
        typeof x === 'object' &&
        x.meta !== null &&
        typeof x.meta === 'object' &&
        typeof x.meta.status === 'number' &&
        (
            (x.error === null && x.data !== null) ||
            (
                x.data === null &&
                x.error !== null &&
                typeof x.error === 'object' &&
                typeof x.error.code === 'number' &&
                typeof x.error.message === 'string'
            )
        );
}

export interface ZcoindErrorResponseMessage {
    data: null;
    meta: {
        status: number;
    };
    error: {
        code: number;
        message: string;
    }
}

function isZcoindErrorResponseMessage(x: any): x is ZcoindErrorResponseMessage {
    return isZcoindResponseMessage(x) && (x.error !== null);
}

export class ZcoindErrorResponse extends ZcoindError {
    call: string;
    error: ZcoindErrorResponseMessage;
    errorMessage: string;
    errorCode: number;

    constructor(call: string, error: ZcoindErrorResponseMessage) {
        super(`${call} call failed (${error.error.code}): ${error.error.message}`);
        this.name = 'ZcoindErrorResponse';
        this.call = call;
        this.error = error;
        this.errorMessage = error.error.message;
        this.errorCode = error.error.code;
    }
}

export class UnexpectedZcoindResponse extends ZcoindError {
    response: unknown;
    call: string;

    constructor(call: string, response: unknown) {
        super(`unexpected response to call ${call}`);
        this.name = 'UnexpectedZcoindResponse';
        this.call = call;
        this.response = response;

        logger.error(`Unexpected response to call ${call}: ${JSON.stringify(response)}`);
    }
}

export class IncorrectPassphrase extends ZcoindError {
    call: string;

    constructor(call: string) {
        super(`incorrect passphrase for ${call} call`);
        this.name = 'IncorrectPassphrase';
        this.call = call;
    }
}

// This is thrown when connecting to zcoind takes too long. It probably indicates that zcoind is already running.
export class ZcoindConnectionTimeout extends ZcoindError {
    constructor(seconds: number) {
        super(`unable to connect to zcoind within ${seconds}s; a reason this might happen is that you have another instance of zcoind not managed by Zcoin Client running`);
        this.name = 'ZcoindConnectionTimeout';
    }
}

// This is thrown when we find a zcoind instance already listening when we haven't yet started one.
export class ZcoindAlreadyRunning extends ZcoindError {
    constructor() {
        super('Another zcoind instance running with -clientapi=1 is already running');
        this.name = 'ZcoindAlreadyRunning';
    }
}

export class ZcoindAlreadyShutdown extends ZcoindError {
    constructor() {
        super('zcoind has already been shutdown');
        this.name = 'ZcoindAlreadyShutdown';
    }
}

type Network = 'mainnet' | 'regtest' | 'test';
export class InvalidNetwork extends ZcoindError {
    constructor() {
        super("valid network types are 'mainnet', 'regtest', and 'test'");
        this.name = 'InvalidNetwork';
    }
}
function assertValidNetwork(x: any): x is Network {
    if (!['mainnet', 'regtest', 'test'].includes(x)) {
        throw new InvalidNetwork();
    }

    return true;
}

export interface ApiStatus {
    data: {
        version: number;
        protocolVersion: number;
        walletVersion: number;
        walletLock: boolean;
        dataDir: string;
        // Note that this is DIFFERENT from the Network type.
        network: 'main' | 'test' | 'regtest';
        blocks: number;
        connections: number;
        devAuth: boolean;
        synced: boolean;
        pid: number;
        reindexing: boolean;
        rescanning: boolean;
        modules: {
            [moduleName: string]: boolean;
        };
        Znode: {
            localCount: number;
            totalCount: number;
            enabledCount: number;
        };
        hasMnemonic: boolean;

    };
    meta: {
        status: number;
    };
    error: string | null;
}

// one transaction output, of which a transaction may have many.
export interface TransactionOutput {
    // A unique ID generated on the client side (outside this file) which identifies the transaction. It will be
    // different for outgoing and incoming versions of the same transactions.
    uniqId?: string;
    isChange: boolean;
    category: string;
    txid: string;
    txIndex: number;
    firstSeenAt: number;
    label?: string;
    fee?: number;
    amount: number;
    address?: string;
    blockHeight?: number;
    blockHash?: string;
    blockTime?: number;
    available?: boolean;
    spendable?: boolean;
    locked?: boolean;
}
function isValidTransactionOutput(x: any): x is TransactionOutput {
    const r = x !== null &&
        typeof x === 'object' &&
        (x.uniqId === undefined || typeof x.uniqId === 'string') &&
        typeof x.isChange === 'boolean' &&
        typeof x.category === 'string' &&
        typeof x.txid === 'string' &&
        typeof x.txIndex === 'number' &&
        typeof x.firstSeenAt === 'number' &&
        (x.label === undefined || typeof x.label === 'string') &&
        (x.fee === undefined || typeof x.fee === 'number') &&
        typeof x.amount === 'number' &&
        (x.address === undefined || typeof x.address === 'string') &&
        (x.blockHeight === undefined || typeof x.blockHeight === 'number') &&
        (x.blockHash === undefined || typeof x.blockHash === 'string') &&
        (x.blockTime === undefined || typeof x.blockTime === 'number') &&
        (x.spendable === undefined || typeof x.spendable === 'boolean') &&
        (x.available === undefined || typeof x.available === 'boolean') &&
        (x.locked === undefined || typeof x.locked === 'boolean');

    if (!r) {
        logger.error("Invalid transaction output: %O", x);
    }

    return r;
}

export interface TransactionInput {
    txid: string;
    index: number;
}
function isValidTransactionInput(x: any): x is TransactionInput {
    const r = x !== null &&
        typeof x === 'object' &&
        typeof x.txid === 'string' &&
        typeof x.index === 'number';

    if (!r) {
        logger.error("Invalid transaction input: %O", x);
    }

    return r;
}

export interface AddressBookItem {
    address: string;
    label: string;
    purpose: string;
}

export interface PaymentChannel {
    paymentCode: string;
    myPaymentCode: string;
    label: string;
    status: boolean;
}

export interface PaymentCodeItem {
    label: string;
    paymentcode: string;
}

function isValidAddressBookItem(x: any): x is AddressBookItem {
    const r = x !== null &&
        typeof x === 'object' &&
        typeof x.address === 'string' &&
        typeof x.label === 'string' &&
        typeof x.purpose === 'string';

    if (!r) {
        logger.error("Invalid address book item: %O", x);
    }

    return r;
}

// This is the data format for initial/stateWallet.
export interface StateWallet {
    inputs?: {
        [outpoint: string]: TransactionInput
    },

    lockedCoins?: {
        [outpoint: string]: TransactionInput
    },

    unlockedCoins?: {
        [outpoint: string]: TransactionInput
    },

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

function isValidStateWallet(x: any): x is StateWallet {
    if (x === null || typeof x !== 'object' || x.addresses === null || typeof x.addresses !== 'object') {
        return false;
    }

    if (x.inputs && !Object.values(x.inputs).find(e => !isValidTransactionInput(e))) {
        return false;
    }

    if (x.lockedCoins && !Object.values(x.lockedCoins).find(e => !isValidTransactionInput(e))) {
        return false;
    }

    if (x.unlockedCoins && !Object.values(x.unlockedCoins).find(isValidTransactionInput)) {
        return false;
    }

    for (const [k, v] of <any[]>Object.entries(x.addresses)) {
        if (['inputs', 'lockedCoins', 'unlockedCoins'].includes(k)) continue;

        if (v === null ||
            typeof v !== 'object' ||
            v.txids === null ||
            typeof v.txids !== 'object' ||
            (v.inputs !== undefined && typeof v.inputs !== 'object') ||
            (v.lockedCoins !== undefined && typeof v.lockedCoins !== 'object') ||
            (v.unlockedCoins !== undefined && typeof v.unlockedCoins !== 'object')) {

            logger.error(`Invalid stateWallet address ${k}: ${JSON.stringify(v)}`)
            return false;
        }

        if (Object.values(v.txids).find(grouping =>
            grouping === null || typeof grouping !== 'object' || Object.values(grouping).find(e => !isValidTransactionOutput(e) && !<any>console.log(e))
        )) {
            return false;
        }
    }

    return true;
}

// This is the data format we're given in 'transaction' events.
export interface TransactionEvent {
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

        lockedCoins?: {
            [outpoint: string]: TransactionInput
        },

        unlockedCoins?: {
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

export interface MasternodeEvent {
    proTxHash: string;
    collateralHash: string;
    collateralIndex: Number;
    collateralAddress: string;
    operatorReward: number;
    state: {
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

export class InvalidMnemonic extends ZcoindError {
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
const coinControlToString = (coinControl: CoinControl) => coinControl.map(e => `${e[0]}-${e[1]}`).join(':');

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

export class ZcoindDoesNotExist extends ZcoindError {
    path: string;

    constructor(path: string) {
        super(`zcoind at path ${path} does not exist`);
        this.name = 'ZcoindDoesNotExist';
    }
}

export class InvalidCertificateFile extends ZcoindError {
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
        parsed = JSON.parse(fs.readFileSync(path).toString());
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

export type ZcoindEventHandler = (daemon: Zcoind, eventData: unknown) => Promise<void>;
export type ZcoindInitializationFunction = (daemon: Zcoind) => Promise<void>;

export class ZcoindStartupError extends ZcoindError {
    error: Error;
    stderr: string;

    constructor(error: Error, stderr: string) {
        super(`error starting zcoind (${error}): ${stderr}`);
        this.name = 'ZcoindStartupError';
        this.error = error;
        this.stderr = stderr;
    }
}

export class RebroadcastError extends ZcoindError {
    error: string;

    constructor(error: string) {
        super(`error rebroadcasting transaction: ${error}`);
        this.name = 'RebroadcastError';
        this.error = error;
    }
}

export class ZnodeStartupError extends ZcoindError {
    error: string;

    constructor(error: string) {
        super(`failed to start znode: ${error}`);
        this.name = 'ZnodeStartupError';
        this.error = error;
    }
}

// We take care of starting the daemon, sending messages, and calling proper event handlers for subscription events.
export class Zcoind {
    // These are synchronisation primitives so as to not send data before zcoind is ready.
    private gotAPIResponseEWH: EventWaitHandle<undefined>;
    private apiIsReadyEWH: EventWaitHandle<undefined>;
    private blockchainLoadedEWH: EventWaitHandle<undefined>;
    private hasConnectedEWH: EventWaitHandle<undefined>;
    private initializersCompletedEWH: EventWaitHandle<undefined>;
    // We resolve with true if zcoind has shutdown cleanly or false if it has crashed.
    private zcoindHasShutdown: EventWaitHandle<boolean>

    // This will ensure only one request is sent at a time.
    private requestMutex: Mutex;
    // This is to ensure start() is only called once.
    private hasStarted: boolean = false;
    // This is to make sure that send() won't be called after we're shutdown.
    private hasShutdown: boolean = false;

    // (requester|publisher)Socket will be undefined prior to the apiIsReadyEWH being released.
    private requesterSocket?: zmq.Socket;
    private publisherSocket?: zmq.Socket;
    private statusPublisherSocket: zmq.Socket;

    // latestApiStatus will be reset every time we get an apiStatus. It will be undefined until we get an apiStatus.
    private latestApiStatus?: ApiStatus;

    // These are the user-provided event handlers that will be called when zcoind receives events.
    private readonly eventHandlers: {[eventName: string]: (daemon: Zcoind, eventData: any) => Promise<void>};
    // These are the functions that will be called after awaitApiIsReady() resolves.
    private readonly initializers: ZcoindInitializationFunction[];
    // This is the network we will tell zcoind to connect to.
    readonly zcoindNetwork: 'mainnet' | 'test' | 'regtest';
    // The location of the zcoind binary, or null to use the default location.
    readonly zcoindLocation: string | null;
    // The directory that zcoind will use to store its data. This must already exist.
    readonly zcoindDataDir: string;

    // If this is set to true, we will connect to an existing zcoind instance (supposing -clientapi is enabled) instead
    // of resetting everything. In this case, initializers will NOT be run.
    allowMultipleZcoindInstances: boolean = false;
    // This is the account name that will be associated in the zcoind backend with addresses we generate with
    // getUnusedAddress.
    addressAccountName: string = 'zcoin-client';

    // zcoindLocation is the location of the zcoind binary.
    //
    // network is the network zcoind should connect to.
    //
    // If zcoindDataDir is null (but NOT undefined or the empty string) we will not specify it and use the default
    // location.
    //
    // All the functions in initializers will be called with zcoind as their only argument after awaitApiIsReady()
    // resolves. When all of them resolve() (or reject()), awaitInitializersCompleted() will resolve.
    //
    // We will automatically register for all the eventNames in eventHandler, except for 'apiStatus', which is a special
    // key that will be called when an apiStatus event is receives.
    constructor(network: 'mainnet' | 'test' | 'regtest', zcoindLocation: string, zcoindDataDir: string | null,
                initializers: ZcoindInitializationFunction[], eventHandlers: {[eventName: string]: ZcoindEventHandler}) {
        assertValidNetwork(network);
        this.zcoindNetwork = network;
        this.zcoindLocation = zcoindLocation;
        this.zcoindDataDir = zcoindDataDir;

        this.initializers = initializers;
        this.eventHandlers = eventHandlers;

        this.requestMutex = new Mutex();
        this.gotAPIResponseEWH = new EventWaitHandle();
        this.apiIsReadyEWH = new EventWaitHandle();
        this.blockchainLoadedEWH = new EventWaitHandle();
        this.hasConnectedEWH = new EventWaitHandle();
        this.initializersCompletedEWH = new EventWaitHandle();
        this.zcoindHasShutdown = new EventWaitHandle();
    }

    // Start the daemon and register handlers.
    //
    // If mnemonicSettings is set, we start up the daemon with the directive to initialize it with the given mnemonic
    // and passphrase. These are not passed in the constructor because we don't want to pass them again if we restart.
    // wallet.dat MUST NOT exist if this option is passed; we will check for it and throw if it does.
    //
    // If zcoind is already listening, we will reject(). If you would like to wait for an existing zcoind instance to
    // stop before calling us (assuming that it was invoked with -clientapi), you can await awaitZcoindNotListening()
    // prior to invoking us.
    //
    // We may be called only once.
    async start(mnemonicSettings?: MnemonicSettings) {
        if (this.hasStarted) {
            throw new ZcoindAlreadyRunning();
        }
        this.hasStarted = true;

        if (mnemonicSettings) {
            assertValidMnemonicSettings(mnemonicSettings);

            let walletLocation;
            switch (this.zcoindNetwork) {
                case "mainnet":
                    walletLocation = path.join(this.zcoindDataDir, "wallet.dat");
                    break;

                case "test":
                    walletLocation = path.join(this.zcoindDataDir, "testnet3", "wallet.dat");
                    break;

                case "regtest":
                    walletLocation = path.join(this.zcoindDataDir, "regtest", "wallet.dat");
                    break

                default:
                    throw new InvalidNetwork();
            }

            if (fs.existsSync(walletLocation)) {
                throw new InvalidMnemonic("Zcoind.start() called with mnemonicSettings set, but wallet.dat already exists");
            }
        }

        // There is potential for a race condition here, but it's hard to fix, only occurs on improper shutdown, and has
        // a fairly small  window anyway,
        if (await this.isZcoindListening()) {
            if (!this.allowMultipleZcoindInstances) {
                throw new ZcoindAlreadyRunning();
            }

            this.awaitHasConnected().then(async () => {
                await this.initializersCompletedEWH.release(undefined);
            });
        } else {
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

            await this.launchDaemon(mnemonicSettings);
        }

        await this.connectAndReact();
    }

    // Wait for the zcoind API to first make a response. This DOES NOT mean that it is safe commands. You must await
    // awaitApiIsReady() for that.
    async awaitApiResponse() {
        await this.gotAPIResponseEWH.block();
    }

    // Resolve when zcoind has loaded the block index.
    async awaitApiIsReady() {
        await this.apiIsReadyEWH.block()
    }

    // Wait for apiStatus to indicate we are not rescanning or reindexing.
    async awaitBlockchainLoaded() {
        await this.blockchainLoadedEWH.block();
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

    // Resolve when we determine that zcoind isn't listening by attempting a connection every 1s.
    async awaitZcoindNotListening() {
        while (true) {
            if (!await this.isZcoindListening()) {
                break;
            }

            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Resolve when we determine that zcoind is listening by attempting a connection every 1s.
    async awaitZcoindListening() {
        while (true) {
            if (await this.isZcoindListening()) {
                break;
            }

            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Await zcoind shutting down. If the shutdown is clean, we will resolve(); if it is unclean, we will reject().
    awaitShutdown(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (await this.zcoindHasShutdown.block()) {
                resolve();
            } else {
                reject();
            }
        });
    }

    // Launch zcoind at zcoindLocation as a daemon with the specified datadir dataDir. Resolves when zcoind exits with
    // status 0, or rejects it with the error given by execFile if something goes wrong.
    //
    // If mnemonicSettings is set, we start up the daemon with the directive to initialize it with the given mnemonic
    // and passphrase.
    private async launchDaemon(mnemonicSettings?: MnemonicSettings): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.zcoindLocation)) {
                throw new ZcoindDoesNotExist(this.zcoindLocation);
            }

            // These are the arguments that will be passed to zcoind.
            const args = ["-clientapi=1"];

            if (process.platform !== "win32") {
                args.push("-daemon=1");
            }

            if (this.zcoindDataDir) {
                args.push(`-datadir=${this.zcoindDataDir}`);
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

            assertValidNetwork(this.zcoindNetwork);
            switch (this.zcoindNetwork) {
                case 'mainnet':
                    args.push("-mainnet=1");
                    break;

                case 'test':
                    args.push("-testnet=1");
                    break;

                case 'regtest':
                    args.push("-regtest=1");
                    // dandelion=0 needs to be set for mining to actually include transactions on regtest.
                    args.push("-dandelion=0");
                    break;

                default:
                    throw 'unreachable';
            }

            logger.info("Starting daemon...");
            if (process.platform === "win32") {
                let hasResolved = false;

                execFile(this.zcoindLocation, args,{}, (error, stdout, stderr) => {
                    if (hasResolved) return;

                    if (error) {
                        logger.error(`Error starting daemon (${error}): ${stderr}`);
                        hasResolved = true;
                        reject(new ZcoindStartupError(error, stderr));
                    }
                });

                this.awaitZcoindListening().then(() => {
                    if (hasResolved) return;

                    logger.info("zcoind is listening. Inferring that we've successfully started the daemon.");
                    hasResolved = true;
                    resolve();
                })
            } else {
                execFile(this.zcoindLocation,
                    args,
                    {timeout: 10_000},
                    (error, stdout, stderr) => {
                        if (error) {
                            logger.error(`Error starting daemon (${error}): ${stderr}`);
                            reject(new ZcoindStartupError(error, stderr));
                        } else {
                            logger.info(`Successfully started daemon: ${stdout}`);
                            resolve();
                        }
                    }
                );
            }
        }
       );
    }


    // Determine whether or not someone is listening on host constants.zcoindAddress.host, port
    // constants.zcoindAddress.statusPort.publisher.
    isZcoindListening(): Promise<boolean> {
        return new Promise(resolve => {
            const socket = new net.Socket();
            socket.setTimeout(5_000);
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
            socket.connect(constants.zcoindAddress.statusPort.publisher, constants.zcoindAddress.host);
        });
    }

    // Connect to the daemon and take action when it serves us appropriate events. Resolves when the daemon connection
    // is made successfully. We will continue to try reconnecting to the zcoind statusPort until a connection is made.
    private async connectAndReact() {
        let finished = false;
        logger.info("Waiting for zcoind to open its ports...");
        // We need to do this because ZMQ will just hang if the socket is unavailable.
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!finished) {
                    logger.error("zcoind has not opened it ports after 30 seconds");
                    finished = true;
                }

                reject(new ZcoindConnectionTimeout(30));
            }, 30_000);

            this.awaitZcoindListening().then(() => {
                if (!finished) {
                    logger.info("zcoind's ports are open.");
                    finished = true;
                }

                resolve();
            });
        });

        this.awaitZcoindNotListening().then(async () => {
            // This will be set if zcoind shutdown cleanly.
            if (this.hasShutdown) {
                logger.debug("zcoind has closed its ports after a clean shutdown");
                return;
            }

            this.hasShutdown = true;
            logger.error("zcoind has died unexpectedly");
            await this.zcoindHasShutdown.release(false);
        });

        logger.info("Setting a watcher to see if zcoind unexpectedly dies...");
        this.awaitZcoindNotListening().then(async () => {
            // TODO
        })

        logger.info("Connecting to zcoind...")
        this.statusPublisherSocket = zmq.socket('sub');

        // Set timeout for requester socket
        this.statusPublisherSocket.setsockopt(zmq.ZMQ_RCVTIMEO, 2000);
        this.statusPublisherSocket.setsockopt(zmq.ZMQ_SNDTIMEO, 2000);

        this.statusPublisherSocket.on('message', (topic, msg) => {
            this.gotApiStatus(msg.toString());
        });

        this.statusPublisherSocket.connect(`tcp://${constants.zcoindAddress.host}:${constants.zcoindAddress.statusPort.publisher}`);
        this.subscribeToApiStatus();
    }

    // This method is needed because zcoind may accept the connection but fail to queue or respond to apiStatus
    // subscriptions. (To my knowledge, this occurs when zcoind is rescanning the block database, which seems to occur
    // after zcoind has been loaded with the same datadir on a new operating system.)
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

            throw new ZcoindError(`subscribing to apiStatus failed: ${e}`);
        }

        setTimeout(() => this.subscribeToApiStatus(), 1500);
    }

    // This function is called when the API status is received. It initialises the (separate) sockets by which we'll
    // send and receive data from zcoind.
    private async gotApiStatus(apiStatusMessage: string) {
        let apiStatus: ApiStatus;
        try {
            apiStatus = JSON.parse(apiStatusMessage);
        } catch (e) {
            logger.error("Failed to parse API status %O", apiStatusMessage);
            throw new ZcoindError(`Failed to parse apiStatus: ${e}`);
        }

        if (apiStatus.error) {
            logger.error("Error retrieving API status: %O", apiStatus);
            throw new UnexpectedZcoindResponse('apiStatus', apiStatus);
        }

        if (apiStatus.meta.status < 200 || apiStatus.meta.status >= 400) {
            logger.error("Received API status with bad status %d: %O", apiStatus.meta.status, apiStatus);
            throw new UnexpectedZcoindResponse('apiStatus', apiStatus);
        }

        this.latestApiStatus = apiStatus;
        await this.gotAPIResponseEWH.release(undefined);

        // modules.API will be set once it is valid to connect to the API.
        if (apiStatus.data && apiStatus.data.modules && apiStatus.data.modules.API) {
            // release() returns true if we are the first to lock the release/poison the EventWaitHandle.
            if (await this.apiIsReadyEWH.release(undefined)) {
                await this.initializeWithApiStatus(apiStatus);
            }
        }

        if (apiStatus.data && apiStatus.data.reindexing === false && apiStatus.data.rescanning === false) {
            await this.blockchainLoadedEWH.release(undefined);
        }

        if (this.eventHandlers['apiStatus']) {
            await this.eventHandlers['apiStatus'](this, apiStatus);
        }
    }

    // This function contains the logic for connecting to proper sockets, registering for events, etc. that are required
    // before initialization. It is called after an apiStatus with modules.API set to true is sent. It MUST NOT be
    // called multiple times.
    private async initializeWithApiStatus(apiStatus: ApiStatus) {
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
                throw new UnexpectedZcoindResponse('apiStatus', apiStatus);
        }

        const [clientPubkey, clientPrivkey] = readCert(path.join(apiStatus.data.dataDir, "certificates", "client", "keys.json"));
        const serverPubkey = readCert(path.join(apiStatus.data.dataDir, "certificates", "server", "keys.json"))[0];

        // Setup encryption.
        for (const s of [this.requesterSocket, this.publisherSocket]) {
            s.curve_serverkey = serverPubkey;
            s.curve_publickey = clientPubkey;
            s.curve_secretkey = clientPrivkey;
        }

        logger.info("Connecting to zcoind controller ports...");

        // These calls give no indication of failure.
        this.requesterSocket.connect(`tcp://${constants.zcoindAddress.host}:${reqPort}`);
        this.publisherSocket.connect(`tcp://${constants.zcoindAddress.host}:${pubPort}`);

        // Subscribe to all events for which we've been given a handler.
        for (const topic of Object.keys(this.eventHandlers)) {
            // apiStatus is a special key that's not actually associated with an event of that name.
            if (topic === 'apiStatus') {
                continue;
            }

            logger.debug("Subscribing to %s events", topic);
            this.publisherSocket.subscribe(topic);
        }

        this.publisherSocket.on('message', (topicBuffer, messageBuffer) => {
            this.handleSubscriptionEvent(topicBuffer.toString(), messageBuffer.toString());
        });

        await this.hasConnectedEWH.release(undefined);
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

        logger.silly("zcoind sent us a subscription event for topic %s: %O", topic, parsedMessage);

        if (parsedMessage.meta.status !== 200) {
            logger.error("zcoind sent us an event for topic %s with a non-200 status: %O", topic, parsedMessage);
            return;
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
    //
    // If zcoind has been shutdown intentionally (but not crashed) this method will throw.
    async send(auth: string | null, type: string, collection: string, data: unknown): Promise<unknown> {
        logger.debug("Sending request to zcoind: type: %O, collection: %O, data: %O", type, collection, data);

        return await this.requesterSocketSend(this.formatSend(auth, type, collection, data));
    }

    private formatSend(auth: string | null, type: string, collection: string, data: unknown): unknown {
        return {
            auth: {
                passphrase: auth
            },
            type,
            collection,
            data
        };
    }

    // Send an object through the requester socket and process the response. Refer to the documentation of send() for
    // what we're actually doing. The reason this method is split off is that the setPassphrase() method is weird and
    // requires a special case.
    //
    // allowAfterShutdown determines whether we are allowed to send after we're marked as having shutdown. This should
    // only be set to true from sendToShutdown().
    private async requesterSocketSend(message: unknown, allowAftersShutdown: boolean = false): Promise<unknown> {
        await this.hasConnectedEWH.block();

        let callName = '<unknown>';
        if (isStandardZcoindRequest(message)) {
            callName = `${message.type}/${message.collection}`;
        } else { // fixme
            console.log('<unknown>');
            console.log(message);
        }

        logger.debug(`Trying to acquire requestMutex for ${callName}...`);
        // We can't have multiple requests pending simultaneously because there is no guarantee that replies come back
        // in order, and also no tag information allowing us to associate a given request to a reply.
        let releaseLock = await this.requestMutex.lock();
        logger.debug(`Acquired requestMutex for ${callName}`);

        const release = () => {
            logger.debug(`Releasing requestMutex for ${callName}...`)
            releaseLock();
        };

        return new Promise(async (resolve, reject) => {
            if (this.hasShutdown && !allowAftersShutdown) {
                reject(new ZcoindAlreadyShutdown());
                return;
            }

            try {
                this.requesterSocket.send(JSON.stringify(message));
            } catch (e) {
                try {
                    await this.sendError(e);
                } finally {
                    release();
                    reject(e);
                }
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
                    reject(new UnexpectedZcoindResponse(callName, e));
                    return;
                }

                logger.debug(`received reply from zcoind for ${callName}: %O`, message);

                if (isZcoindResponseMessage(message)) {
                    if (message.meta.status === 200) {
                        resolve(message.data);
                    } else if (isZcoindErrorResponseMessage(message)) {
                        if (message.error.code === -14) {
                            reject(new IncorrectPassphrase(callName));
                        } else {
                            reject(new ZcoindErrorResponse(callName, message));
                        }
                    }
                } else {
                    reject(new UnexpectedZcoindResponse(callName, message));
                }

                release();
            });
        });
    }

    // Stop the daemon.
    async stopDaemon() {
        await this.sendToShutdown(null, 'initial', 'stop', null);
    }

    // Run a command, knowing that it will result in zcoind to shut down. If zcoind is shut down in any other way, it
    // will be considered a crash. This takes the same arguments as send.
    private async sendToShutdown(auth: string | null, type: string, collection: string, data: unknown) {
        if (this.hasShutdown) {
            throw new ZcoindAlreadyShutdown();
        }

        this.hasShutdown = true;

        await this.requesterSocketSend(this.formatSend(auth, type, collection, data), true);

        logger.info("Waiting for zcoind to close its ports.");
        await this.awaitZcoindNotListening();

        this.statusPublisherSocket.close();
        this.publisherSocket.close();
        this.requesterSocket.close();

        await this.zcoindHasShutdown.release(true);
    }

    // This is called when an error sending to zcoind has occurred.
    async sendError(error: any) {
        logger.error("Error sending data to zcoind: %O", error);
    }

    // Actions

    // See stopDaemon() for another available action.

    // See restartDaemon() for another available action.

    // Invoke a legacy RPC command.
    //
    // NOTE: legacyRpc commands sometimes require auth, but they take it as a special legacyRpc command
    //       (walletpassphrase) which is called prior to invoking the protected command.
    async legacyRpc(commandline: string): Promise<{result: null | unknown, error: null | {code: number, message: string}}> {
        // Yes, it is correct to infer that zcoind can parse the argument list but cannot parse the command name.
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
            throw new UnexpectedZcoindResponse('create/legacyRpc', data);
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
            throw new UnexpectedZcoindResponse('initial/rpc', data);
        }

        const categories = Object.values(data.categories);
        const helpEntries = categories.reduce((a: string[], x: string[]) => a.concat(x), []);
        return helpEntries.map(x => x.split(' ')[0]);
    }

    // Create a new payment request (to be stored on the daemon-side).
    //
    // If address is not specified, a new address will be created.
    //
    // NOTE: zcoind doesn't send out a subscription event when a new payment request is created, so the caller is
    //       responsible for any updating of state that might be required.
    async createPaymentRequest(amount: number | undefined, label: string, message: string, address?: string): Promise<PaymentRequestData> {
        return <any>await this.send(null, 'create', 'paymentRequest', {
            amount,
            label,
            address,
            message
        });
    }

    // Update an existing payment request.
    //
    // NOTE: zcoind doesn't send out a subscription event when a payment request is updated, so the caller is
    //       responsible for any updating of state that might be required.
    async updatePaymentRequest(address: string, amount: number | undefined, label: string, message: string, state: PaymentRequestState): Promise<PaymentRequestData> {
        return <any>await this.send(null, 'update', 'paymentRequest', {
            id: address,
            amount,
            label,
            message,
            state
        });
    }

    // Publicly send amount satoshi XZC to recipient. resolve()s with txid, or reject()s if we have insufficient funds
    // or the call fails for some other reason.
    //
    // If coinControl is specified, it should be a list of [txid, txindex] pairs specifying the inputs to be used for
    // this transaction.
    async publicSend(auth: string, label: string, recipient: string, amount: number, feePerKb: number,
                     subtractFeeFromAmount: boolean, coinControl?: CoinControl): Promise<string> {
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
                selected: coinControl ? coinControlToString(coinControl) : ''
            }
        });

        function isValidResponse(x: any): x is {txid: string} {
            return x !== null && typeof x === 'object' && typeof x.txid === 'string';
        }

        if (isValidResponse(data)) {
            return data.txid;
        } else {
            throw new UnexpectedZcoindResponse('create/sendZcoin', data);
        }
    }

    async lockCoins(auth: string, lockedCoins: string, unlockedCoins: string): Promise<string> {
        const data = await this.send(auth, 'create', 'lockCoins', {
            lockedCoins: lockedCoins,
            unlockedCoins: unlockedCoins
        });

        if (typeof data === 'string') {
            return data;
        } else {
            throw new UnexpectedZcoindResponse('create/lockCoins', data);
        }
    }

    // Privately send amount satoshi XZC to recipient, subtracting the fee from the amount.
    //
    // If coinControl is specified, it should be a list of [txid, txindex] pairs specifying the inputs to be used for
    // this transaction.
    //
    // resolve()s with txid, or reject()s if we have insufficient funds or the call fails for some other reason.
    async privateSend(auth: string, label: string, recipient: string, amount: number, subtractFeeFromAmount: boolean,
                      coinControl?: CoinControl): Promise<string> {
        const data = await this.send(auth, 'create', 'sendPrivate', {
            outputs: [
                {
                    address: recipient,
                    amount
                }
            ],
            label,
            subtractFeeFromAmount,
            coinControl: {
                selected: coinControl ? coinControlToString(coinControl) : ''
            }
        });

        if (typeof data === 'string') {
            return data;
        } else {
            throw new UnexpectedZcoindResponse('create/sendPrivate', data);
        }
    }

    async showMnemonics(auth: string): Promise<string> {
        const data = await this.send(auth, 'create', 'showMnemonics', {});
        if (typeof data === 'string') {
            return data;
        }

        throw new UnexpectedZcoindResponse('create/showMnemonics', data);
    }

    async writeShowMnemonicWarning(auth: string, dontShowMnemonicWarning: boolean) : Promise<void> {
        await this.send(auth, 'create', 'writeShowMnemonicWarning', {dontShowMnemonicWarning});
    }
    
    async readAddressBook() : Promise<AddressBookItem[]> {
        const data = await this.send('', 'create', 'readAddressBook', {});
        if (data instanceof Array && !data.find(e => !isValidAddressBookItem(e))) {
            return data;
        }

        throw new UnexpectedZcoindResponse('create/readAddressBook', data);
    }

    async getPaymentCodes() : Promise<string[]> {
        const data = await this.send('', 'create', 'getPaymentCodes', {});
        if (data instanceof Array) {
            return data;
        }

        throw new UnexpectedZcoindResponse('create/getPaymentCodes', data);
    }

    async createNewPaymentCode() : Promise<Object> {
        const data = await this.send('', 'create', 'createNewPaymentCode', {});
        return data;
    }

    async getMasternodeList() : Promise<Object> {
        const data = await this.send('', 'initial', 'masternodeList', {});
        return data;
    }

    async readPaymentChannelsState() : Promise<Object> {
        const data = await this.send('', 'create', 'readPaymentChannelsState', {});
        return data;
    }

    async editAddressBook(address_: string, label_: string, purpose_: string, action_: string, updatedaddress_:string, updatedlabel_: string) : Promise<void> {
        await this.send('', 'create', 'editAddressBook', {
            address: address_,
            label: label_, // FIXME: This field is required, but its value is ignored.
            purpose: purpose_,
            action: action_,
            updatedaddress: updatedaddress_,
            updatedlabel: updatedlabel_
        });
    }

    // Get an unused address with no associated label.
    async getUnusedAddress(): Promise<string> {
        const data = await this.send(null, 'none', 'paymentRequestAddress', null);

        if (typeof data === 'object' && typeof data['address'] === 'string') {
            return data['address'];
        }

        throw new UnexpectedZcoindResponse('none/paymentRequestAddress', data);
    }

    // Mint Zerocoins in the given denominations. zerocoinDenomination must be one of '0.05', '0.1', '0.5', '1', '10',
    // '25', or '100'; values are how many to mint of each type. (e.g. passing mints: {'100': 2} will mint 200
    // Zerocoin). We resolve() with the generated txid, or reject() with an error if something went wrong.
    async mintZerocoin(auth: string, mints: {[zerocoinDenomination: string]: number}): Promise<string> {
        const data = await this.send(auth, 'create', 'mint', {
            denominations: mints
        });
        if (typeof data === 'string') {
            return data;
        }

        throw new UnexpectedZcoindResponse('create/mint', data);
    }

    // calcPublicTxFee and calcPrivateTxFee require an address as input despite the fact that the response is the same
    // regardless of which address is passed. We hardcode them here so that those functions don't have to take a
    // superfluous parameter.
    private defaultAddress(): string {
        switch (this.zcoindNetwork) {
            case "mainnet":
                // 40 XZC output from block 1.
                return "aEF2p3jepoWF2yRYZjb6EACCP4CaP41doV";

            case "regtest":
            case "test":
                // 40 XZC output from testnet block 1. testnet and regtest use the same addresses
                return "TAczBFWtiP8mNstdLn1Z383z51rZ1vHk5N";

            default:
                throw "unreachable";
        }
    }

    // Calculate a transaction fee for a public transaction.
    // feePerKb is the satoshi fee per kilobyte for the generated transaction.
    //
    // We resolve() with the calculated fee in satoshi.
    // We reject() the promise if the zcoind call fails or received data is invalid.
    async calcPublicTxFee(amount: number, subtractFeeFromAmount: boolean, feePerKb: number): Promise<number> {
        let data = await this.send(null, 'get', 'txFee', {
            addresses: {
                [this.defaultAddress()]: amount
            },
            feePerKb,
            subtractFeeFromAmount
        });

        function isValidResponse(x: any): x is {fee: number} {
            return x !== null &&
                typeof x === 'object' &&
                typeof x.fee === 'number';
        }

        if (isValidResponse(data)) {
            return data.fee
        }

        throw new UnexpectedZcoindResponse('get/txFee', data);
    }

    // Calculate a transaction fee for a private transaction. You may not specify custom transaction fees for private
    // transactions.
    //
    // We resolve() with the calculated fee in satoshi.
    // We reject() the promise if the zcoind call fails or received data is invalid.
    async calcPrivateTxFee(amount: number, subtractFeeFromAmount: boolean): Promise<number> {
        let data = await this.send(null, 'none', 'privateTxFee', {
            outputs: [
                {
                    address: this.defaultAddress(),
                    amount
                }
            ],
            // The response is the same no matter what label we use.
            label: '',
            subtractFeeFromAmount
        });

        function isValidResponse(x: any): x is {fee: number} {
            return x !== null &&
                typeof x === 'object' &&
                typeof x.fee === 'number';
        }

        if (isValidResponse(data)) {
            return data.fee
        }

        throw new UnexpectedZcoindResponse('get/privateTxFee', data);
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
            throw new UnexpectedZcoindResponse('create/rebroadcast', data);
        }
    }

    // Start a Znode by alias. If the call fails, we reject() with the cause.
    async startZnode(auth: string, znodeAlias: string): Promise<void> {
        const data = await this.send(auth, 'update', 'znodeControl', {
            method: 'start-alias',
            alias: znodeAlias
        });

        function isValidResponse(x: any): x is {
            overall: {
                total: 1
            },
            detail: {
                status: {
                    success: boolean,
                    info?: string
                }
            }
        } {
            return x !== null &&
                typeof x === 'object' &&
                x.overall !== null &&
                typeof x.overall === 'object' &&
                x.overall.total === 1 &&
                x.detail !== null &&
                typeof x.detail === 'object' &&
                x.detail.status !== null &&
                typeof x.detail.status.success === 'boolean' &&
                (!x.detail.status.success !== !!x.detail.status.info) &&
                (!x.detail.status.info || typeof x.detail.status.info === 'string')
        }

        if (!isValidResponse(data)) {
            throw new UnexpectedZcoindResponse('update/znodeControl', data);
        }

        // If the call failed, r.detail[0].info will be the error message; otherwise, it will be blank.
        if (!data.detail.status.success) {
            throw new ZnodeStartupError(data.detail.status.info);
        }
    }

    // Change zcoind settings. If the call fails (e.g. invalid setting names), it will be reject()ed. Note that zcoind
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
            throw new UnexpectedZcoindResponse('initial/setting', data);
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

    // Calling this causes a number of address events containing information about the state of the wallet to be sent in
    // addition to the return value here. Handlers for address events must be set *in addition* to processing the return
    // value of this function.
    //
    // WARNING: THE RETURN VALUE OF THIS FUNCTION CONTAINS ONLY A SMALL PORTION OF THE REQUESTED DATA.
    async getStateWallet(): Promise<StateWallet> {
        const data = await this.send(null, 'initial', 'stateWallet', null);

        if (isValidStateWallet(data)) {
            return data;
        }

        throw new UnexpectedZcoindResponse('initial/stateWallet', data);
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
}