import Vue from 'vue'
import { getName, getTypeName } from '~/utils'
import { getAppSettings } from '#/lib/utils'

const tn = getTypeName

const types = function (namespace) {
    const { NAME } = getName(namespace)

    return {
        [tn(`SET ${NAME} LAST SEEN`)]: tn(`SET ${NAME} LAST SEEN`),
        [tn(`SET ALL ${NAME} LAST SEEN`)]: tn(`SET ALL ${NAME} LAST SEEN`)
    }
}

const module = function (namespace = '', moduleName = '') {
    const { name, NAME } = getName(namespace)
    const stateKey = `${name}LastSeen`
    const actionName = tn(`SET ${NAME} LAST SEEN`)
    const actionNameAll = tn(`SET_ALL ${NAME} LAST SEEN`)

    return {
        state: {
            [stateKey]: {}
        },

        mutations: {
            [actionName] (state, { id, timestamp }) {
                Vue.set(state, stateKey, {
                    ...state[stateKey],
                    [id]: timestamp
                })
            }
        },

        actions: {
            [actionNameAll] ({ commit }, allLastSeen) {
                const pairs = Object.entries(allLastSeen)

                pairs.forEach(([ id, timestamp ]) => {

                    commit(actionName, { id, timestamp })
                })
            },

            [actionName] ({ commit, state }, { id, timestamp }) {
                commit(actionName, {
                    id,
                    timestamp: timestamp || Date.now()
                })

                getAppSettings().set(`${(moduleName || name).toLowerCase()}.${actionNameAll}`, state[stateKey])
            }
        },

        getters: {
            [stateKey]: (state) => (id) => state[stateKey][id] || null
        }
    }
}

export default {
    types,
    module
}
