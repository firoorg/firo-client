import { getName, getTypeName } from 'store/utils'

const tn = getTypeName

const types = function (namespace) {
    const { NAME } = getName(namespace)

    return {
        [tn(`IS ${NAME} LOADING`)]: tn(`IS ${NAME} LOADING`)
    }
}

const module = function (namespace = '') {
    const { Name, NAME } = getName(namespace)

    return {
        state: {
            [`is${Name}Loading`]: false
        },

        mutations: {
            [tn(`IS ${NAME} LOADING`)] (state, value) {
                state[`is${Name}Loading`] = value
            }
        },

        getters: {
            [`is${Name}Loading`]: (state) => state[`is${Name}Loading`]
        }
    }
}

export default {
    types,
    module
}
