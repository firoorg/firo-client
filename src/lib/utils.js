const subscribeToMutation = function ({ store, namespace, onStoreMutation }) {
    store.subscribe((mutation) => {
        const {type, payload} = mutation

        if (!type.startsWith(`${namespace}/`)) {
            return
        }
        const action = type.replace(`${namespace}/`, '')

        onStoreMutation({action, payload, type, namespace})
    })
}

const subscribeToAction = function ({ store, namespace, onStoreAction }) {
    store.subscribeAction((action) => {
        const {type, payload} = action

        if (!type.startsWith(`${namespace}/`)) {
            return
        }
        const actionName = type.replace(`${namespace}/`, '')

        onStoreAction({action: actionName, payload, type, namespace})
    })
}

export const connectToStore = function ({ store, namespace, onStoreMutation, onStoreAction }) {
    if (onStoreMutation) {
        subscribeToMutation({store, namespace, onStoreMutation})
    }

    if (onStoreAction) {
        subscribeToAction({store, namespace, onStoreAction})
    }
}

export const sleep = function (ms) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(), ms))
}
