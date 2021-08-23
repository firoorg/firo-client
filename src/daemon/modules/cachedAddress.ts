import {Firod} from "../firod";



export async function initialize(store: any, firod: Firod) {
    store.commit('App/setCachedAddress', await firod.getUnusedAddress());
}