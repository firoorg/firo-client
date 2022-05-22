export function handleEvent(store, firod, msg: string) {
    store.commit('App/appendLogMessage', msg);
}
