import Vue from 'vue'
import { getName, getTypeName } from '~/utils'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store:mixins:response')

const tn = getTypeName

const types = function (namespace) {
    const { NAME } = getName(namespace)

    return {
        [tn(`SET ${NAME} RESPONSE`)]: tn(`SET ${NAME} RESPONSE`),
        [tn(`CLEAR ${NAME} RESPONSE`)]: tn(`CLEAR ${NAME} RESPONSE`),
        [tn(`ON ${NAME} SUCCESS`)]: tn(`ON ${NAME} SUCCESS`),
        [tn(`ON ${NAME} ERROR`)]: tn(`ON ${NAME} ERROR`)
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
            [tn(`CLEAR ${NAME} RESPONSE`)] (state) {
                const responseName = `${name}Response`

                Vue.set(state, responseName, {
                    _meta: null,
                    data: null,
                    error: null
                })
            },

            [tn(`SET ${NAME} RESPONSE`)] (state, response) {
                const responseName = `${name}Response`
                const { _meta, data, error } = response

                logger.debug('updating', tn(`SET ${NAME} RESPONSE`), response)
                /*
                Vue.set(state, `${name}Response`, {
                    ...response,
                    _meta,
                    data,
                    error
                })
                */
                state[responseName]._meta = _meta
                state[responseName].data = data
                state[responseName].error = error
                /*
                state[responseName] = {
                    ...state[responseName],
                    ...response
                }
                */
            }
        },

        actions: {
            [tn(`CLEAR ${NAME} RESPONSE`)] ({ commit, state }) {
                if (!state[`${name}Response`] || !state[`${name}Response`]._meta) {
                    return
                }

                commit(t[tn(`CLEAR ${NAME} RESPONSE`)])
            },

            [tn(`ON ${NAME} SUCCESS`)] ({ commit, dispatch, state }, response) {
                commit(t[tn(`SET ${NAME} RESPONSE`)], response)
            },

            [tn(`ON ${NAME} ERROR`)] ({ commit, dispatch, state }, response) {
                logger.warn(t[tn(`ON ${NAME} ERROR`)])
                logger.debug(response)

                try {
                    commit(t[tn(`SET ${NAME} RESPONSE`)], response)
                } catch (e) {
                    logger.error(e)
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
