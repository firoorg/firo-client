const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const getName = (namespace) => {
    const name = `pending${ucfirst(namespace)}Payments`
    const Name = ucfirst(name)

    return {
        name,
        Name
    }
}

const types = function (namespace) {
    return {
        TESTING: 'TESTING'
    }
}

const module = function (namespace = '') {
    const { name, Name } = getName(namespace)

    return {
        state: {
            pendingPayments: {}
        },

        mutations: {

        },

        actions: {
            TESTING () {
                console.log('yes, works!')
            }
        },

        getters: {
            [name]: (state) => Object.values(state.pendingPayments),
            [`${name}Size`]: (state, getters) => getters[name].length,
            [`has${Name}`]: (state, getter) => !!getter[`${[name]}Size`]
        }
    }
}

export default {
    types,
    module
}
