import Vue from 'vue'
import eachOfLimit from 'async/eachOfLimit'
import throttle from 'lodash/throttle'

import geoip from 'geoip-lite'

import * as types from '~/types/Znode'

import Debug from 'debug'

const debug = Debug('zcoin:store:znode')

const state = {
    znodes: {}
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
    }
}

const processZnode = function (id, znode) {
    if (state.znodes[id]) {
        debug('TODO: znode already exists -> updating')
        // todo add other flexible keys here
        const { status } = znode

        return {
            ...state.znodes[id],
            status
        }
    }

    const { authority } = znode
    const { ip } = authority
    const location = geoip.lookup(ip)

    return {
        ...znode,
        location
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
    // todo ask @tadhg why my znodes (at least without as proper status) are not included in the initial response
    [types.SET_INITIAL_STATE] ({ commit, state }, initialState) {
        // console.log('got initial state from ZNODE', initialState)

        const { status } = initialState._meta
        delete initialState._meta

        if (status !== 200) {
            const { error } = initialState

            if (status === 400 && error.code === -1) {
                debug(`nothing to process on initial state: "${error.message}"`)
                return
            }

            debug(error)
            return
        }

        let initialZnodes = {}

        // add maximal 10 nodes at a time
        eachOfLimit(initialState, 10, async (znode, id) => {
            // const { id, znode } = znodeData

            // const ip = authority.split(':')[0]

            initialZnodes[id] = processZnode(id, znode)
            /*
            dispatch(types.ADD_ZNODE, {
                id: znodeKey,
                znode // : initialState[znodeKey]
            })
            */
        })

        addZnodes(commit, initialZnodes)
    },

    [types.ON_ZNODE_SUBSCRIPTION] ({ commit, state }, data) {
        if (!data) {
            return
        }

        let onSubscriptionZnodes = {}

        // add maximal 10 nodes at a time
        eachOfLimit(data, 10, async (znode, id) => {
            onSubscriptionZnodes[id] = processZnode(id, znode)
            /*
            const bar = dispatch(types.ADD_ZNODE, {
                id: znodeKey,
                znode // : data[znodeKey]
            })

            console.log(bar)
            */
        })

        addZnodes(commit, onSubscriptionZnodes)
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
            debug('TODO: znode already exists -> updating')
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
    }
}

const getters = {
    allZnodes: (state, getters, rootState, rootGetters) => Object.values(state.znodes).map((znode) => {
        const lastPayoutTimestamp = 0 // todo get state from address module

        const { payeeAddress: id } = znode
        return {
            ...znode,
            lastPayoutTimestamp,
            id
        }
    }),

    myZnodes: (state, getters) => getters.allZnodes
        // .slice(0, Math.min(getters.allZnodes.length, 200))
        .filter((znode) => {
            const { isMine } = znode

            return isMine
        }),

    remoteZnodes: (state, getters) => getters.allZnodes.filter((znode) => {
        const { isMine } = znode

        return !isMine
    }),

    totalZnodes: (state, getters) => getters.allZnodes.length,
    enabledZnodes: (state, getters) => {
        const enabledZnodes = getters.allZnodes.filter((znode) => {
            return znode.status === 'ENABLED'
        })

        return enabledZnodes.length
    },

    znodePaymentCycleInDays: (state, getters, rootState, rootGetters) => {
        const avgBlockTimeInMs = rootGetters['Blockchain/averageBlockTimeInMilliSeconds']
        console.log('avgBlockTimeInMs', avgBlockTimeInMs)
        // console.log('rootGetters.blockchain.averageBlockTime', rootGetters.blockchain.averageBlockTime)
        const blocksPerDay = (1000 * 60 * 60 * 24) / avgBlockTimeInMs

        // todo check if only enabled nodes are taken into calculation
        return getters.enabledZnodes / blocksPerDay
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
