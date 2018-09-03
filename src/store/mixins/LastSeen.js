import Vue from 'vue'
import { getName, getTypeName } from '~/utils'

const tn = getTypeName

const types = function (namespace) {
    const { NAME } = getName(namespace)

    return {
        [tn(`SET ${NAME} LAST SEEN`)]: tn(`SET ${NAME} LAST SEEN`)
    }
}

const module = function (namespace = '') {
    const { name, NAME } = getName(namespace)

    return {
        state: {
            [`${name}LastSeen`]: {}
        },

        mutations: {
            [tn(`SET ${NAME} LAST SEEN`)] (state, id) {
                if (!state[`${name}LastSeen`]) {
                    Vue.set(state, `${name}LastSeen`, {})
                }

                Vue.set(state[`${name}LastSeen`], id, Date.now())
            }
        },

        actions: {
            [tn(`SET ${NAME} LAST SEEN`)] ({ commit }, id) {
                commit(tn(`SET ${NAME} LAST SEEN`), id)
            }
        },

        getters: {
            [`${name}LastSeen`]: (state) => (id) => state[`${name}LastSeen`][id] || null
        }
    }
}

export default {
    types,
    module
}
