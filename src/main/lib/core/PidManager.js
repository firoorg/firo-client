import { promisify } from 'util'
import { exec, spawn } from 'child_process'
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
    constructor ({ path: filePath, name, store, onStarted, onStop, heartbeatIntervalInSeconds = 5, autoRestart = false, maxAutoRestartTries = 5 }) {
        logger.info('setting up a new PidManager for %s', name)
        logger.info('going to write pid file to "%s"', filePath)

        this.pid = -1
        this.child = null

        this.filePath = filePath
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
            this.pid = await this.readPidFromFs()
        } catch (e) {
            console.log(e)
        }

        if (await this.isRunning()) {
            logger.info('daemon is still running. no need to start it...')
            this.onStart()
            return this.pid
        }

        logger.debug('spawning with arguments %o', this.getArguments())

        this.child = spawn(this.pathToSpawn, this.getArguments(), {
            // detached: true,
            stdio: 'ignore'
        })

        // @see https://stackoverflow.com/a/18694940/520544
        // this.child.stdin.pause()

        this.pid = this.child.pid

        // not using detached at the moment
        this.child.unref()

        logger.info('started managed process with pid id %d', this.pid)

        await this.write()
        this.onStart()

        return this.pid
    }

    onStart () {
        this.startHeartbeat()

        this.onStarted({
            pid: this.pid
        })
    }

    stop () {
        this.store.dispatch(types.app.DAEMON_STOP)
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

    getFileSystemPath () {
        return join(this.filePath, `${this.name}.pid`)
    }

    getArguments () {
        return [
            ...this.getDataDirArgument()
        ]
    }

    getDataDirArgument () {
        const hasLocation = this.store.getters['App/hasBlockchainLocation']
        const location = this.store.getters['App/blockchainLocation']
        const exists = hasLocation ? fs.existsSync(location) : false

        if (location && !exists) {
            logger.warn('blockchain location %s does not exist. falling back to default location', location)
        }

        return hasLocation && exists ? [`-datadir=${location}`] : []
    }

    async cleanup () {
        try {
            await unlink(this.getFileSystemPath())
        } catch (e) {
            if (e.code !== 'ENOENT') {
                logger.error(e)
            }
        }
        this.pid = -1
        this.child = null
        this.store.dispatch(types.network.NETWORK_CONNECTION_LOST)

        if (this.heartbeat) {
            clearTimeout(this.heartbeat)
            this.heartbeat = null
        }
        logger.debug('removed .pid file and reset this.pid')
    }

    async write () {
        const pid = `${this.pid}\n`
        await writeFile(this.getFileSystemPath(), pid)
        logger.info('wrote pid %d to path', this.pid)
    }

    async readPidFromFs () {
        try {
            const content = parseInt(await readFile(this.getFileSystemPath()))
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
