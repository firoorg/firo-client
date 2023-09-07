import {Firod} from "../firod";

export async function initialize(store: any, firod: Firod) {
    await firod.awaitApiIsReady();
    store.commit('Settings/setDaemonSettings', await firod.getSettings());
}

export const name = 'settings';