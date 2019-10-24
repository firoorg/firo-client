import { app } from 'electron';
import { promisify } from 'util'
import spawn from 'cross-spawn'
import { join } from 'path'
import fs from 'fs'

import { createLogger } from '#/lib/logger'
import { sleep, connectToStore } from '#/lib/utils'

import types from '~/types'

const logger = createLogger('zcoin:core:manager')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

export default class PidManager {
    constructor ({ name, pidDirectory, store, onStarted, onStop, heartbeatIntervalInSeconds = 5, autoRestart = false, maxAutoRestartTries = 5 }) {
        logger.info('setting up a new PidManager for %s', name)

        this.pid = -1
        this.pidDirectory = pidDirectory
        this.child = null

        this.name = name
        this.store = store

        this.heartbeat = null
        this.setHeartbeatIntervalInSeconds(heartbeatIntervalInSeconds)

        this.autoRestartCounter = 0
        this.maxAutoRestartTries = maxAutoRestartTries
        autoRestart ? this.enableAutoRestart() : this.disableAutoRestart()

        this.onStarted = onStarted || (() => {})

        this.connectToStore()
    }

    setPathToSpawn (pathToSpawn) {
        this.pathToSpawn = pathToSpawn
    }

    /*
     * Wait for file to exist, checks every 500 milliseconds
     *
     * @see this.setPid for more infos
    async waitForPid () {
        return new Promise((resolve, reject) => {
            let counter = 0

            const timeout = setInterval(async () => {
                counter++

                if (counter > 100) {
                    clearInterval(timeout)
                    logger.warn('pid file not found after 100 attempts')
                    reject(-1)
                    return
                }

                const fsPid = await this.readPidFromFileSystem()

                if (fsPid && fsPid > 0) {
                    if (timeout) {
                        clearInterval(timeout)
                    }

                    resolve(fsPid)
                }
            }, 500)
        })
    }
    */

    async waitForDaemonShutdown () {
        return new Promise((resolve, reject) => {
            let counter = 0

            if (this.pid === -1) {
                return resolve()
            }

            const timeout = setInterval(async () => {
                counter++

                if (counter > 100) {
                    clearInterval(timeout)
                    // reject(new Error('zcoind did not shutdown after sending the shutdown signal %d seconds ago', 100))
                    return
                }

                try {
                    process.kill(this.pid, 0) // testing existence of pid
                } catch (e) {
                    // error occurred as pid was not found
                    await this.removePidFromFileSystem()

                    if (timeout) {
                        clearInterval(timeout)
                    }

                    resolve()
                }

            }, 1000)
        })
    }

    async start (pathToSpawn) {
        logger.info(`starting child process "${this.name}" ...`)
        if (!this.pathToSpawn && !pathToSpawn) {
            logger.warn('could not start daemon process. no path to spwan given')
            return
        }

        // set path to spawn on the first run
        if (!this.pathToSpawn && pathToSpawn) {
            this.pathToSpawn = pathToSpawn
        }

        try {
            this.pid = await this.readPidFromFileSystem()
        } catch (e) {
            this.pid = -1
        }

        if (await this.isRunning()) {
            logger.info('daemon is still running. no need to start it...')
            this.onStarted()
            return
        }

        logger.debug('spawning with arguments %o', this.getArguments())

        this.child = spawn(this.pathToSpawn, this.getArguments(), {
            detached: process.env.NODE_ENV !== 'production', // run detached in dev to allow hot reloading
            stdio: 'ignore'
        })

        this.child.on('exit', (code, signal) => {
            if (this.lastHeartbeat) {
                // Failure is not on startup, so other restart functionality should be available.
                logger.error(`zcoind exited on startup with ${code !== null ? 'code' : 'signal'} ${ code !== null ? code : signal}`);
            } else if (code !== 0) {
                // If zcoind fails on startup, give up and kill ourselves hard.
                logger.error(`zcoind exited on startup with ${code !== null ? 'code' : 'signal'} ${ code !== null ? code : signal}; killing ourselves`);
                app.exit(-1);
            }
        });

        // start network to receive path
        this.onStarted()

        // @see https://stackoverflow.com/a/18694940/520544
        // this.child.stdin.pause()

        // not using detached at the moment
        if (process.env.NODE_ENV !== 'production') {
            this.child.unref()
        }

        logger.info('started daemon process')
    }

    stop () {
        this.store.dispatch(types.app.DAEMON_STOP)
    }

    // daemon pid is provided by the api status until
    // https://github.com/bitcoin/bitcoin/pull/15456 finds it way back to the zcoin codebase
    async setPid (pid) {
        this.pid = pid
        logger.debug('received pid from api status %d', this.pid)
        await this.writePidToFileSystem()
        this.startHeartbeat()
    }

    enableAutoRestart () {
        this.autoRestart = true
        logger.debug('auto start enabled')
    }

    isAutoRestartEnabled () {
        return this.autoRestart && this.autoRestartCounter < this.maxAutoRestartTries
    }

    disableAutoRestart () {
        this.autoRestart = false
        logger.debug('auto start disabled')
    }

    async isRunning () {
        if (this.pid === -1) {
            logger.debug('daemon is not running')
            return false
        }

        try {
            process.kill(this.pid, 0) // testing existence of pid

            this.store.dispatch(types.app.DAEMON_IS_RUNNING)
            this.store.dispatch(types.network.NETWORK_IS_CONNECTED)
            return true
        } catch (e) {
            await this.cleanup()

            this.store.dispatch(types.app.DAEMON_STOPPED)
        }

        return false
    }

    getPidFileSystemPath () {
        return join(this.pidDirectory, `${this.name}.pid`)
    }

    getArguments () {
        return [
            '-clientapi=1',
            ...this.getDataDirArgument()
        ]
    }

    getDataDirArgument () {
        const hasLocation = this.store.getters['App/hasBlockchainLocation']
        const location = this.store.getters['App/blockchainLocation']
        const exists = hasLocation ? fs.existsSync(location) : false

        const cleanedLocation = location.replace(/(regtest|testnet3)$/, '')

        if (cleanedLocation && !exists) {
            logger.warn('blockchain location %s does not exist. falling back to default location', location)
        }

        return hasLocation && exists ? [`-datadir=${cleanedLocation}`] : []
    }

    async cleanup () {
        await this.removePidFromFileSystem()

        this.pid = -1
        this.child = null
        this.store.dispatch(types.network.NETWORK_CONNECTION_LOST)

        if (this.heartbeat) {
            clearTimeout(this.heartbeat)
            this.heartbeat = null
        }
        logger.debug('reset this.pid and cleared heartbeat')
    }

    async writePidToFileSystem () {
        const pid = `${this.pid}\n`
        const pathToWrite = this.getPidFileSystemPath()

        if (pathToWrite) {
            await writeFile(pathToWrite, pid)
            logger.info('wrote pid %d to path %s', this.pid, pathToWrite)
        }
    }

    async readPidFromFileSystem () {
        const filePath = this.getPidFileSystemPath()

        if (!filePath) {
            return -1
        }

        const pidFileExists = fs.existsSync(filePath)

        if (!pidFileExists) {
            return -1
        }

        logger.info('reading pid from %s', filePath)

        try {
            const content = parseInt(await readFile(filePath))
            return content > 0 ? content : -1
        } catch (e) {
            if (e.code !== 'ENOENT') {
                logger.error(e)
            } else {
                logger.debug('pid file does not exist')
            }
        }

        return -1
    }

    async removePidFromFileSystem () {
        try {
            const pathToUnlink = this.getPidFileSystemPath()
            if (pathToUnlink) {
                await unlink(pathToUnlink)
            }
        } catch (e) {
            if (e.code !== 'ENOENT') {
                logger.error(e)
            }
        }
    }

    setHeartbeatIntervalInSeconds (value) {
        if (!value || value === this.heartbeatInterval) {
            return
        }

        this.heartbeatInterval = value * 1000
    }

    startHeartbeat () {
        if (this.heartbeat) {
            logger.debug('heartbeat is already running...')
            return
        }

        logger.info('starting heartbeat')

        const beat = () => {
            this.heartbeat = setTimeout(async () => {
                await this.onHeartbeat(beat)
            }, this.heartbeatInterval)
        }

        beat()
    }

    async onHeartbeat (beat) {
        this.lastHeartbeat = Date.now()

        if (await this.isRunning()) {
            this.autoRestartCounter = 0
            return beat()
        }

        logger.warn('onHeartbeat: NOT RUNNING ANYMORE')

        clearTimeout(this.heartbeat)
        this.heartbeat = null

        await this.cleanup()
        this.doAutoRestart()
    }

    doAutoRestart () {
        const isRestarting  = this.store.getters['App/isRestarting']

        if (!isRestarting && !this.isAutoRestartEnabled()) {
            return
        }

        logger.info('restarting daemon...')
        this.start()

        if (this.isAutoRestartEnabled()) {
            this.autoRestartCounter++
        }
    }

    connectToStore () {
        connectToStore({
            store: this.store,
            namespace: 'App',

            onStoreMutation: async (mutation) => {
                const { type } = mutation

                if (type === types.app.DAEMON_START) {
                    await this.start()
                }
            }
        })
    }
}
