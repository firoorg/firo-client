import { app, remote } from 'electron'
import fs from 'fs';
import path from 'path';
import {homedir} from 'os';
import Mutex from 'await-mutex';

class AppSettings {
    constructor() {
        // Used to make sure set() doesn't run into a race condition.
        this.mutex = new Mutex();
    }

    /**
     * Get application settings in an OS-native way (registry, .config, plist file), returning {} if the file does not
     * yet exist.
     *
     * @returns {Promise<Object<string, Object>>} key/value pairs
     */
    async getAll() {
        switch (process.platform) {
        case "darwin":
            const plist = require('simple-plist');

            const plistLocation = path.join(homedir(), 'Library', 'Preferences', 'io.Zcoin-Client.plist');
            if (fs.existsSync(plistLocation)) {
                return plist.readFileSync(plistLocation);
            } else {
                return {};
            }

        case "linux":
        case "openbsd":
        case "freebsd":
            const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
            const configLocation = path.join(xdgConfigHome, 'zcoin-client', 'zcoin-client.conf');
            if (fs.existsSync(configLocation)) {
                const raw = fs.readFileSync(configLocation);
                return JSON.parse(raw);
            } else {
                return {};
            }

        // Settings are saved as values in the \Software\Zcoin\Zcoin_Client\Settings registry entry.
        case "win32":
            const Registry = require('winreg');
            const regKey = new Registry({
                hive: Registry.HKCU,
                key: `\\Software\\Zcoin\\Zcoin_Client\\Settings`
            });

            return new Promise((resolve, reject) => {
                regKey.keyExists((err, exists) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!exists) {
                        resolve({});
                        return;
                    }

                    regKey.values((err, regItems) => {
                        if (err) {
                            console.log(`Error: ${err}`)
                            reject(err);
                            return;
                        }

                        const result = {};
                        for (const regItem of regItems) {
                            console.log(`key: ${regItem.key} ${regItem.name} ${regItem.value}`);
                            result[regItem.name] = JSON.parse(regItem.value);
                        }

                        resolve(result);
                    });
                });
            });

        default:
            throw 'unsupported platform';
        }
    }

    /**
     * Get a single key.
     *
     * @param {string} key
     * @returns {Promise<Object>}
     */
    async get(key) {
        return (await this.getAll())[key];
    }

    /**
     * Set application settings in an OS-native way (registry, .config, plist file).
     *
     * @param {string} key
     * @param {Object} value
     */
    async set(key, value) {
        console.info(`Acquiring mutex to set setting ${key} = ${value}`);
        // Make sure only one set() function can be running at once so we don't race in the period between reading
        // settings and writing them.
        const release = await this.mutex.lock();
        console.info(`Acquired mutex to set setting ${key} = ${value}`);

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

            release();
            break;


        case "linux":
        case "openbsd":
        case "freebsd":
            const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
            const zcoinConfigDir = path.join(xdgConfigHome, 'zcoin-client');
            const configLocation = path.join(zcoinConfigDir, 'zcoin-client.conf');

            for (const dir of [xdgConfigHome, zcoinConfigDir]) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
            }

            const config = await this.getAll();
            config[key] = value;

            fs.writeFileSync(configLocation, JSON.stringify(config));

            release();
            break;

        // Our settings are saved as a JSON-encoded object as the default value of \Software\Zcoin\Zcoin_Client\Settings.
        case "win32":
            const Registry = require('winreg');
            const regKey = new Registry({ hive: Registry.HKCU, key:  `\\Software\\Zcoin\\Zcoin_Client\\Settings` });

            return new Promise((resolve, reject) => {
                // Creating the key even if it exists is fine.
                regKey.create(async (err) => {
                    if (err) {
                        console.log(`Error creating registry key: ${err}`);
                        reject(err);
                        release();
                    }

                    // Empty string represents the default value.
                    regKey.set(key, 'REG_SZ', JSON.stringify(value), (err) => {
                        if (err) {
                            console.log(`Error setting setting ${key} to ${value}`);
                            reject(err);
                            release();
                        } else {
                            console.log(`Set setting setting ${key} to ${value}`);
                            resolve(undefined);
                            release();
                        }
                    });
                });
            });


        default:
            release();
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

