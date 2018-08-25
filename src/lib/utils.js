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

// todo move to utils
export const tryUntil = async function ({
    functionToTry,
    validator,
    ttlInSeconds,
    retryInterval = 100,
    errorMessage = 'tryUntil timed out'
}) {
    let start = Date.now()
    const runner = async (resolve, reject) => {
        const { meta, data } = await functionToTry()
        const { status } = meta

        if (validator({ status, data })) {
            resolve(data)
            return
        }

        if (Date.now() - start < ttlInSeconds * 1000) {
            await sleep(retryInterval)
            await runner(resolve, reject)
            return
        }

        reject(new Error(`${errorMessage} / TTL: ${ttlInSeconds}`))
    }

    return new Promise(runner)
}

export const sleep = function (ms) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(), ms))
}

export const ucFirst = function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
