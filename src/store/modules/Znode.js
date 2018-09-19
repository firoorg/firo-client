import * as types from '~/types/Znode'

import Debug from 'debug'
const debug = Debug('zcoin:store:znode')

const state = {
    znodes: {}
}

const mutations = {
    [types.ADD_ZNODE] (state, { id, znode }) {
        state.znodes[id] = znode
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch, state }, initialState) {
        console.log('got initial state from ZNODE')

        const { status } = initialState._meta

        if (status !== 200) {
            const { error } = initialState

            if (status === 400 && error.code === -1) {
                debug(`nothing to process on initial state: "${error.message}"`)
                return
            }

            debug(error)
            return
        }

        const { data } = initialState
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

    [types.ON_ZNODE_SUBSCRIPTION] ({ dispatch, state }, onSubscriptionData) {
        const { data } = onSubscriptionData

        if (!data) {
            return
        }

        console.log('received update from ZNODE subscription')
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
        const { id, znode } = znodeData

        if (state[id]) {
            debug('TODO: znode already exists -> updating')
            return
        }

        commit(types.ADD_ZNODE, {
            id,
            znode
        })
    }
}

const getters = {
    // myZnodes: (state) => Object.entries(state.znodes)
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
