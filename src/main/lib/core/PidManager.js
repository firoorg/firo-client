import { promisify } from 'util'
import { exec, spawn } from 'child_process'
import { join } from 'path'
import fs from 'fs'

import Debug from 'debug'
import { sleep, connectToStore } from '#/lib/utils'

import types from '~/types'

const debug = Debug('zcoin:core:manager')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

export default class PidManager {
    constructor ({ path: filePath, name, store, onStarted, onStop, heartbeatIntervalInSeconds = 5, autoRestart = false, maxAutoRestartTries = 5 }) {
        debug('setting up a new PidManager for %s', name)
        debug('going to write pid file to "%s"', filePath)

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
        debug(`starting child process "${this.name}" ...`)
        if (!this.pathToSpawn && !pathToSpawn) {
            debug('could not start daemon process. no path to spwan given')
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
            debug('daemon is still running. no need to start it...')
            this.onStart()
            return this.pid
        }

        this.child = spawn(this.pathToSpawn, {
            // detached: true,
            stdio: 'ignore'
        })

        // @see https://stackoverflow.com/a/18694940/520544
        // this.child.stdin.pause()

        this.pid = this.child.pid

        // not using detached at the moment
        this.child.unref()

        debug('started managed process with pid id', this.pid)

        await this.write()
        this.onStart()

        return this.pid
    }

    onStart () {
        this.startHeartbeat()
        console.log('onStarted...')
        this.onStarted({
            pid: this.pid
        })
    }

    stop () {
        this.store.dispatch(types.app.DAEMON_STOP)
    }

    enableAutoRestart () {
        this.autoRestart = true
        debug('auto start enabled')
    }

    isAutoRestartEnabled () {
        return this.autoRestart && this.autoRestartCounter < this.maxAutoRestartTries
    }

    disableAutoRestart () {
        this.autoRestart = false
        debug('auto start disabled')
    }

    async isRunning () {
        if (this.pid === -1) {
            debug('not running pid --> %d', this.pid)
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

    async cleanup () {
        try {
            await unlink(this.getFileSystemPath())
        } catch (e) {
            if (e.code !== 'ENOENT') {
                debug(e)
            }
        }
        this.pid = -1
        this.child = null
        this.store.dispatch(types.network.NETWORK_CONNECTION_LOST)

        if (this.heartbeat) {
            clearTimeout(this.heartbeat)
            this.heartbeat = null
        }
        debug('removed .pid file and reset this.pid')
    }

    async write () {
        const pid = `${this.pid}\n`
        await writeFile(this.getFileSystemPath(), pid)
        debug('wrote pid %d to path', this.pid)
    }

    async readPidFromFs () {
        try {
            const content = parseInt(await readFile(this.getFileSystemPath()))
            debug('content %s', content)
            return content > 0 ? content : -1
        } catch (e) {
            if (e.code !== 'ENOENT') {
                console.error(e)
            } else {
                debug('file does not exist')
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
            debug('heartbeat is already running...')
            return
        }

        debug('starting heartbeat')

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

        debug('onHeartbeat: NOT RUNNING ANYMORE')

        clearTimeout(this.heartbeat)
        this.heartbeat = null

        this.cleanup()
        this.doAutoRestart()
    }

    doAutoRestart () {
        const isRestarting  = this.store.getters['App/isRestarting']

        if (!isRestarting && !this.isAutoRestartEnabled()) {
            return
        }

        debug('restarting daemon...')
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

                console.log(type)

                if (type === types.app.DAEMON_START) {
                    await this.start()
                }
            }
        })
    }

}
