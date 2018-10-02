import Vue from 'vue'
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
    }
}

const actions = {
    // todo ask @tadhg why my znodes (at least without as proper status) are not included in the initial response
    [types.SET_INITIAL_STATE] ({ dispatch, state }, initialState) {
        console.log('got initial state from ZNODE')

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

        const znodeKeys = Object.keys(initialState)

        if (!znodeKeys.length) {
            return
        }

        znodeKeys.forEach((znodeKey) => {
            dispatch(types.ADD_ZNODE, {
                id: znodeKey,
                znode: initialState[znodeKey]
            })
        })
    },

    [types.ON_ZNODE_SUBSCRIPTION] ({ dispatch, state }, data) {
        if (!data) {
            return
        }

        console.log('received update from ZNODE subscription', Object.keys(data))
        const znodeKeys = Object.keys(data)

        if (!znodeKeys.length) {
            return
        }

        znodeKeys.forEach((znodeKey) => {
            dispatch(types.ADD_ZNODE, {
                id: znodeKey,
                znode: data[znodeKey]
            })
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
    [types.ADD_ZNODE] ({ commit, state }, znodeData) {
        console.log('znode data', znodeData)
        const { id, znode } = znodeData
        const { authority } = znode
        const { ip } = authority

        // const ip = authority.split(':')[0]

        const location = geoip.lookup(ip)
        console.log('location', location)

        if (state[id]) {
            debug('TODO: znode already exists -> updating')
            return
        }

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

        return {
            ...znode,
            lastPayoutTimestamp
        }
    }),

    myZnodes: (state, getters) => getters.allZnodes.filter((znode) => {
        const { isMine } = znode

        return isMine
    }),

    remoteZnodes: (state, getters) => getters.allZnodes.filter((znode) => {
        const { isMine } = znode

        return !isMine
    }),

    totalZnodes: (state, getters) => getters.allZnodes.length,
    znodePaymentCycleInDays: (state, getters, rootState, rootGetters) => {
        const blocksPerDay = 144 // todo get from avg block

        return getters.totalZnodes / blocksPerDay
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
