import { app, remote } from 'electron'
import fs from 'fs';
import path from 'path';
import {homedir} from 'os';


class AppSettings {
    /**
     * Get application settings in an OS-native way (registry, .config, plist file), returning {} if the file does not
     * yet exist.
     *
     * @returns {Object<string, Object>} key/value pairs
     */
    getAll() {
        switch (process.platform) {
        case "darwin":
            const plist = require('simple-plist');

            const plistLocation = path.join(homedir(), 'Library', 'Preferences', 'io.Zcoin-Client.plist');
            if (fs.existsSync(plistLocation)) {
                return plist.readFileSync(plistLocation);
            } else {
                return {};
            }

        default:
            throw 'unsupported platform';
        }
    }

    /**
     * Get a single key.
     *
     * @param {string} key
     * @returns {Object}
     */
    get(key) {
        return this.getAll()[key];
    }

    /**
     * Set application settings in an OS-native way (registry, .config, plist file).
     *
     * @param {string} key
     * @param {Object} value
     */
    set(key, value) {
        switch (process.platform) {
        case "darwin":
            const plist = require('simple-plist');

            const plistLocation = path.join(homedir(), 'Library', 'Preferences', 'io.Zcoin-Client.plist');
            let parsed;
            if (fs.existsSync(plistLocation)) {
                parsed = plist.readFileSync(plistLocation);
            } else {
                parsed = {};
            }

            parsed[key] = value;
            plist.writeBinaryFileSync(plistLocation, parsed);

            break;

        default:
            throw 'unsupported platform';
        }
    }
}

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
    retryInterval = 200,
    errorMessage = 'tryUntil timed out'
}) {
    let start = Date.now()
    const runner = async (resolve, reject) => {
        const { meta, data } = await functionToTry()
        const { status } = meta

        if (validator({ status, data })) {
            resolve({ meta, data })
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

export const isRenderer = function () {
    return (process && process.type === 'renderer')
}

export const getApp = function () {
    return isRenderer() ? remote.app : app
}

const appSettings = new AppSettings();
export const getAppSettings = function () {
    return appSettings
}

