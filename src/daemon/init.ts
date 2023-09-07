// Initialization routines for firod.

import * as addressBook from './modules/addressBook';
import * as apiStatus from './modules/apiStatus';
import * as masternodeList from './modules/masternodeList';
import * as masternode from './modules/masternode';
import * as settings from './modules/settings';
import * as stateWallet from './modules/stateWallet';
import * as transaction from './modules/transaction';

import { Firod, MnemonicSettings, Network } from './firod';

/// Start up firod, connect to it, and return a Firod instance. If allowMultipleFirodInstances is true, instead of
// giving an error if there is an existing firod instance running OR the wallet is unlocked, we will connect to it
// without running initializers.
async function firod(store: any, network: Network, firodLocation: string, firodDataDir: string,
                     mnemonicSettings?: MnemonicSettings, allowMultipleFirodInstances?: boolean,
                     runInitializersIfFirodIsRunning?: boolean, connectionTimeout?: number,
                     extraArgs?: string[]): Promise<Firod> {
    // For each component in src/lib/daemon/modules, we register the exported function handleEvent() as an event handler for
    // the event with the name of the module, and also call the exported initialize() function.
    //
    // Each module may export a function handler:
    //
    //     async handleEvent(vuexStore: VuexStore, firod: Firod, eventData: any)
    //
    // and also may export an initializer, which will be called after the block index is loaded:
    //
    //     async initialize(vuexStore: VuexStore, firod: Firod)
    //
    const eventHandlers: {[topic: string]: (firod: Firod, eventData: any) => Promise<void>} = {};
    const initializers = [];

    for (const component of [addressBook, apiStatus, masternodeList, masternode, settings, stateWallet, transaction]) {
        const topic = component.name;

        if (component['handleEvent']) {
            eventHandlers[topic] = async (firod, eventData) => component['handleEvent'](store, firod, eventData);
        }

        if (component['initialize']) {
            // Things won't work properly if component.initialize isn't an AsyncFunction.
            if (component['initialize'].constructor.name !== "AsyncFunction") {
                throw `invalid initializer for ${topic}: initializer must be an async function`;
            }

            initializers.push(
                async (firod) => {
                    // Wallet is not locked. Don't run initializers.
                    if (!await firod.isWalletLocked()) {
                        return;
                    }

                    await component['initialize'](store, firod);
                }
            );
        }
    }
    const firod = new Firod(network, firodLocation, firodDataDir, initializers, eventHandlers);
    firod.killOldFirod = !allowMultipleFirodInstances;
    firod.extraFirodArgs = extraArgs;
    firod.allowMultipleFirodInstances = !!allowMultipleFirodInstances;
    firod.runInitializersIfFirodIsRunning = !!runInitializersIfFirodIsRunning;
    if (connectionTimeout) firod.connectionTimeout = connectionTimeout;
    await firod.start(mnemonicSettings);

    return firod;
}

export default firod;
