import { promisify } from 'util'
import { exec, spawn } from 'child_process'
import { join } from 'path'
import fs from 'fs'
import psTree from 'ps-tree'
import Debug from 'debug'

import types from '~/types'

const debug = Debug('zcoin:core:manager')

psTree[promisify.custom] = function (pid) {
    return new Promise((resolve, reject) => {
        psTree(pid, (err, child) => {
            if (err) {
                return reject(err)
            }

            return resolve(child)
        })
    })
}
const processTree = promisify(psTree)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const IS_WINDOWS = /^win/.test(process.platform)

export default class PidManager {
    constructor ({ path: filePath, name, store, onStarted, heartbeatIntervalInSeconds = 5, autoRestart = false, maxAutoRestartTries = 5 }) {
        debug('setting up a new PidManager for %s', name)
        debug('going to write pid file to "%s"', filePath)

        this.filePath = filePath
        this.name = name
        this.store = store

        this.heartbeat = null
        this.setHeartbeatIntervalInSeconds(heartbeatIntervalInSeconds)

        this.maxAutoRestartTries = maxAutoRestartTries
        autoRestart ? this.enableAutoRestart() : this.disableAutoRestart()

        this.onStarted = onStarted || (() => {})
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
            return
        }

        // todo test abstact spawning by passing in ...arguments
        // const ls = spawn('bash', [...arguments])
        // this.child = spawn('exec', [pathToSpawn])
        this.child = spawn(this.pathToSpawn, {
            detached: true,
            stdio: 'ignore'
        })

        // @see https://stackoverflow.com/a/18694940/520544
        // this.child.stdin.pause()

        this.pid = this.child.pid

        this.child.unref()

        debug('started managed process with pid id', this.pid)

        await this.write()
        this.onStart()
        this.store.dispatch(types.network.NETWORK_IS_CONNECTED)

        return this.pid
    }

    onStart () {
        this.startHeartbeat()
        console.log('onStarted...')
        this.onStarted({
            pid: this.pid
        })
    }

    async stop () {
        if (!await this.isRunning()) {
            debug('- not running')
            return
        }

        // npm i tree-kill
        debug('- stopping core...')
        await this.kill()
        debug('- cleaning up')
        await this.cleanup()
    }

    enableAutoRestart () {
        this.autoRestart = true
        // todo set up auto restart listener if already running
        debug('auto start enabled')
    }

    disableAutoRestart () {
        this.autoRestart = false
        // todo remove auto restart listener
        debug('auto start disabled')
    }

    async isRunning () {
        if (this.pid === -1) {
            debug('not running pid --> %d', this.pid)
            return false
        }

        try {
            process.kill(this.pid, 0) // testing existence of pid
            this.store.dispatch(types.network.NETWORK_IS_CONNECTED)
            return true
        } catch (e) {
            await this.cleanup()
        }

        return false
    }

    // ---

    async killProcess (pid, signal = 'SIGTERM') {
        debug('killing process %d with signal %s', pid, signal)

        if (pid === -1) {
            return
        }

        try {
            if (IS_WINDOWS) {
                await exec('taskkill /PID ' + pid + ' /T /F')
            } else {
                process.kill(pid, signal)
            }
        } catch (e) {
            // already killed
            if (e.code !== 'ESRCH') {
                debug(e)
            }
        }
    }

    async kill (signal) {
        debug('killing', this.name)

        if (this.pid === -1) {
            debug('not running...', this.name)
            return
        }

        try {
            console.log('doo')
            const children = await processTree(this.pid)
            console.log('foo', children)
            let pids = [this.pid]

            console.log(pids)

            pids = pids.concat(children.map(p => p.PID))
            for (let pid of pids) {
                await this.killProcess(pid, signal)
            }
        } catch (e) {
            console.log(e)
        }
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

    // --- private

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
        debug('do auto restart:', this.autoRestart)

        if (!this.autoRestart || this.autoRestartCounter >= this.maxAutoRestartTries) {
            return
        }

        debug('daemon died. restarting it...')
        this.start()
        this.autoRestartCounter++
    }

    /*
  setupEvents () {
    debug('setting up events')

    // todo as we do not get any events from a previously started daemon this should be handled via the heartbeat
    this.child.on('close', async (code) => {
      console.log(`child process exited with code ${code}`)
      this.cleanup()

      // todo check if exit code signals clean shutdown -> @see node-forever
      if (this.autoRestart && this.autoRestartCounter < this.maxAutoRestartTries) {
        debug('daemon died. restarting it...')
        // todo handle failed starts
        this.start()
        this.autoRestartCounter++
      }
    })
  }
  */
}
