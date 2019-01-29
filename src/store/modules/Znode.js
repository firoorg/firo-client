import Vue from 'vue'
import eachOfLimit from 'async/eachOfLimit'
import throttle from 'lodash/throttle'
import geoip from 'geoip-lite'
import * as types from '~/types/Znode'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store:znode')

const state = {
    znodes: {},
    total: 0,

    // read only settings
    znodeCollateralInSatoshi: 100000000000,
    znodeStates: [
        {
            name: 'valid',
            states: [
                'ENABLED'
            ]
        },
        {
            name: 'pending',
            states: [
                'PRE_ENABLED',
                'MISSING'
            ]
        },
        {
            name: 'needs-attention',
            states: [
                'EXPIRED',
                'OUTPOINT_SPENT',
                'UPDATE_REQUIRED',
                'WATCHDOG_EXPIRED',
                'NEW_START_REQUIRED',
                'POSE_BAN'
            ]
        }
    ]
}

const mutations = {
    [types.ADD_ZNODE] (state, { id, znode }) {
        Vue.set(state.znodes, id, znode)
    },

    [types.ADD_ZNODES] (state, newZnodes) {
        state.znodes = {
            ...state.znodes,
            ...newZnodes
        }
    },

    [types.SET_TOTAL] (state, total) {
        state.total = total
    }
}

const processZnode = function (id, znode) {
    const { rank } = znode

    // set sort rank to infinity if no rank defined to move them to the end of the list
    const sortRank = rank ? rank : Infinity

    // already computed additional fields. merging...
    if (state.znodes[id]) {
        return {
            ...state.znodes[id],
            ...znode,
            sortRank
        }
    }

    const { authority } = znode

    if (!authority) {
        logger.warn('znode without authority given %o', znode)
        return
    }

    const { ip } = authority
    const location = geoip.lookup(ip)

    return {
        status: 'MISSING',
        ...znode,
        id,
        location,
        sortRank
    }
}

let pendingZnodes = {}
const addZnodes = function (commit, list) {
    // console.log('adding znodes to pending list')
    pendingZnodes = {
        ...pendingZnodes,
        ...list
    }

    addZnodesThrottled(commit)
}

const addZnodesThrottled = throttle(function (commit) {
    // console.log('finally adding znodes')
    commit(types.ADD_ZNODES, pendingZnodes)

    pendingZnodes = {}
}, 2000)

const actions = {
    [types.SET_INITIAL_STATE] ({ commit, state }, initialState) {
        logger.info('got initial state from ZNODE %o', initialState)

        const { status } = initialState._meta
        delete initialState._meta

        if (status !== 200) {
            const { error } = initialState

            if (status === 400 && error.code === -1) {
                logger.debug(`nothing to process on initial state: "${error.message}"`)
                return
            }

            logger.warn(error)
            return
        }

        let initialZnodes = {}

        commit(types.SET_TOTAL, initialState.total)

        // process maximal 10 nodes at a time
        eachOfLimit(initialState.nodes, 10, (znode, id, callback) => {
            initialZnodes[id] = processZnode(id, znode)
            callback()
        }, () => {
            addZnodes(commit, initialZnodes)
        })
    },

    [types.ON_ZNODE_SUBSCRIPTION] ({ commit, state }, data) {
        if (!data) {
            return
        }

        let onSubscriptionZnodes = {}

        // add maximal 10 nodes at a time
        eachOfLimit(data, 10, (znode, id, callback) => {
            onSubscriptionZnodes[id] = processZnode(id, znode)
            callback()
        }, () => {
            addZnodes(commit, onSubscriptionZnodes)
        })
    },

    /**
     * { outpoint: 'COutPoint(057da4cfd5bfec2ba844e1fc2520fc08c2fd6fc9e5dc5c37f89ddcf4d0709154, 1)', // <--- will be changed to json
     *   status: 'NEW_START_REQUIRED',
     *   protocolVersion: 90024,
     *   payeeAddress: 'TRtaq4f2xsZdZj6tMM1itPfPFPdiZCH6nH',
     *   lastSeen: 1529940755,
     *   activeSeconds: 0,
     *   lastPaidTime: 0,
     *   lastPaidBlock: 0,
     *   authority: '51.15.82.184:18168',
     *   isMine: false,
     *   qualify: {
     *     result: false, description: 'not valid for payment'
     *   }
     * }
     * @param commit
     * @param state
     * @param znodeData
     */
    async [types.ADD_ZNODE] ({ commit, state }, znodeData) {
        const { id, znode } = znodeData

        if (state.znodes[id]) {
            logger.info('TODO: znode already exists -> updating')
            return
        }

        const { authority } = znode
        const { ip } = authority
        const location = geoip.lookup(ip)

        commit(types.ADD_ZNODE, {
            id,
            znode: {
                ...znode,
                location
            }
        })
    },

    [types.SET_TOTAL] ({ commit, state }, total) {
        if (state.total === total) {
            return
        }

        commit(types.SET_TOTAL, total)
    }
}

const getters = {
    allZnodes: (state, getters, rootState, rootGetters) => Object.values(state.znodes).map((znode) => {
        const lastPayoutTimestamp = 0 // todo get state from address module

        const authorityIp = znode.authority ? znode.authority.ip : ''

        return {
            ...znode,
            lastPayoutTimestamp,
            authorityIp
        }
    }),

    myZnodes: (state, getters) => {
        return getters.allZnodes
            .filter((znode) => {
                const { isMine } = znode

                return isMine
            })
    },

    getMyZnode: (state, getters) => {
        return (address) => {
            return getters.myZnodes
                .find((znode) => {
                    const { payeeAddress } = znode

                    return payeeAddress === address
                })
        }
    },

    isZnodeAddress: (state, getters) => {
        return (address) => {
            return !!getters.myZnodes.find(({ payeeAddress }) => payeeAddress === address)
        }
    },

    remoteZnodes: (state, getters) => {
        return getters.allZnodes
            .filter((znode) => {
                const { isMine } = znode

                return !isMine
            })
    },

    totalZnodes: (state, getters) => state.total > getters.allZnodes.length ? state.total : getters.allZnodes.length,

    enabledZnodes: (state, getters) => {
        const enabledZnodes = getters.allZnodes.filter((znode) => {
            return znode.status === 'ENABLED'
        })

        return enabledZnodes.length
    },

    znodePaymentCycleInDays: (state, getters, rootState, rootGetters) => {
        const avgBlockTimeInMs = rootGetters['Blockchain/averageBlockTimeInMilliSeconds']
        const blocksPerDay = (1000 * 60 * 60 * 24) / avgBlockTimeInMs

        return getters.enabledZnodes / blocksPerDay
    },

    znodeCollateralInSatoshi: (state) => state.znodeCollateralInSatoshi,
    znodeStates: (state) => state.znodeStates
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
