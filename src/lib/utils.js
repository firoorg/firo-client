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

            const plistLocation = path.join(homedir(), 'Library', 'Preferences', 'io.Firo-Client.plist');
            if (fs.existsSync(plistLocation)) {
                return plist.readFileSync(plistLocation);
            } else {
                return {};
            }

        case "linux":
        case "openbsd":
        case "freebsd":
            const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
            const configLocation = path.join(xdgConfigHome, 'firo-client', 'firo-client.conf');
            if (fs.existsSync(configLocation)) {
                const raw = fs.readFileSync(configLocation);
                return JSON.parse(raw);
            } else {
                return {};
            }

        // Settings are saved as values in the \Software\Firo\Firo_Client\Settings registry entry.
        case "win32":
            const Registry = require('winreg');
            const regKey = new Registry({
                hive: Registry.HKCU,
                key: `\\Software\\Firo\\Firo_Client\\Settings`
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
                            reject(err);
                            return;
                        }

                        const result = {};
                        for (const regItem of regItems) {
                            try {
                                result[regItem.name] = JSON.parse(regItem.value);
                            } catch(e) {
                                console.error(`registry entry ${regItem.key}/${regItem.name} had invalid JSON: ${regItem.value}`);
                            }
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

            const plistLocation = path.join(homedir(), 'Library', 'Preferences', 'io.Firo-Client.plist');
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
            const firoConfigDir = path.join(xdgConfigHome, 'firo-client');
            const configLocation = path.join(firoConfigDir, 'firo-client.conf');

            for (const dir of [xdgConfigHome, firoConfigDir]) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
            }

            const config = await this.getAll();
            config[key] = value;

            fs.writeFileSync(configLocation, JSON.stringify(config));

            release();
            break;

        // Our settings are saved as a JSON-encoded object as the default value of \Software\Firo\Firo_Client\Settings.
        case "win32":
            const Registry = require('winreg');
            const regKey = new Registry({ hive: Registry.HKCU, key:  `\\Software\\Firo\\Firo_Client\\Settings` });

            return new Promise((resolve, reject) => {
                // Creating the key even if it exists is fine.
                regKey.create(async (err) => {
                    if (err) {
                        reject(err);
                        release();
                    }

                    // Empty string represents the default value.
                    regKey.set(key, 'REG_SZ', JSON.stringify(value), (err) => {
                        if (err) {
                            reject(err);
                            release();
                        } else {
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

const appSettings = new AppSettings();
export const getAppSettings = function () {
    return appSettings
}

