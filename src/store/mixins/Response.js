import { getName } from '~/mixins/utils'

const types = function (namespace) {
    const { NAME } = getName(namespace)

    return {
        [`SET_${NAME}_RESPONSE`]: `SET_${NAME}_RESPONSE`,
        [`ON_${NAME}_SUCCESS`]: `ON_${NAME}_SUCCESS`,
        [`ON_${NAME}_ERROR`]: `ON_${NAME}_ERROR`
    }
}

const module = function (namespace = '') {
    const { name, NAME } = getName(namespace)
    const t = types(namespace)

    return {
        state: {
            [`${name}Response`]: {
                _meta: null,
                data: null,
                error: null
            }
        },

        mutations: {
            [`SET_${NAME}_RESPONSE`] (state, response) {
                const { _meta, data, error } = response
                console.log(_meta, data, error)
                state[`${name}Response`] = {
                    ...response
                }
            }
        },

        actions: {
            [`ON_${NAME}_SUCCESS`] ({ commit, dispatch, state }, response) {
                commit(t[`SET_${NAME}_RESPONSE`], response)
            },

            [`ON_${NAME}_ERROR`] ({ commit, dispatch, state }, response) {
                console.log(t[`ON_${NAME}_ERROR`])
                console.log(response)

                try {
                    commit(t[`SET_${NAME}_RESPONSE`], response)
                } catch (e) {
                    console.log(e)
                }
            }
        },

        getters: {
            [`${name}Response`]: (state) => state[`${name}Response`],
            [`${name}ResponseIsValid`]: (state, getters) => {
                if (!getters[`${name}Response`] || !getters[`${name}Response`]._meta) {
                    return false
                }

                return getters[`${name}Response`]._meta.status === 200
            },
            [`${name}ResponseIsError`]: (state, getters) => {
                if (!getters[`${name}Response`] || !getters[`${name}Response`]._meta) {
                    return false
                }

                return getters[`${name}Response`]._meta.status !== 200
            },
            [`${name}ResponseError`]: (state, getters) => getters[`${name}ResponseIsError`] ? state[`${name}Response`].error : null
        }
    }
}

export default {
    types,
    module
}
