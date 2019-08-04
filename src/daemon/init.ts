// Initialization routines for zcoind.

import { Zcoind } from './zcoind';

// For each component in src/lib/daemon/modules, register the exported function handleEvent() as an event handler for
// the event with the name of the module, and also call the exported initialize() function.
//
// Each module may export a function handler:
//
//     async handleEvent(vuexStore: VuexStore, zcoind: Zcoind, eventData: any)
//
// and also may export an initializer:
//
//     async initialize(zcoind: Zcoind, store: VuexStore)
//
function zcoind(store: any): Zcoind {
    // Note how this type differs from the one in zcoind.ts.
    const eventHandlers: {[topic: string]: (zcoind: Zcoind, eventData: any) => Promise<void>} = {};
    const initializers: {[topic: string]: (vuexStore: any, zcoind: Zcoind) => Promise<void>} = {};

    const daemonComponents = require.context('./modules', true, /[^\/]\.ts$/);
    for (const fileName of daemonComponents.keys()) {
        const component = daemonComponents(fileName);
        const topic = fileName.match(/([^\/]+)\.ts$/)[1];

        if (component.handleEvent) {
            eventHandlers[topic] = async (zcoind, eventData) => component.handleEvent(store, zcoind, eventData);
        }

        if (component.initialize) {
            initializers[topic] = component.initialize;
        }
    }

    const zcoind = new Zcoind(eventHandlers);
    zcoind.connectAndReact();

    for (const topic of Object.keys(initializers)) {
        // We want to do a specific check for this here because it's easy to get wrong, and if it's wrong, code will
        // continue to work but just be slow.
        if (initializers[topic].constructor.name !== "AsyncFunction") {
            throw `invalid initializer for ${topic}: initializer must be an async function`;
        }

        initializers[topic](store, zcoind);
    }

    return zcoind;
}

export default zcoind;