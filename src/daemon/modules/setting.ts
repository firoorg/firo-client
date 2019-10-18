import {Zcoind} from "../zcoind";

export async function initialize(store: any, zcoind: Zcoind) {
    store.commit('Settings/setDaemonSettings', await zcoind.getSettings());
}