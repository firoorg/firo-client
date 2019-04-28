import * as types from '~/types/Router'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store.routeHelper')

const routeMap = {
    [types.ROUTE_TO_CREATE_PAYMENT_REQUEST]: { name: 'receive-zcoin' },
    [types.ROUTE_TO_PUBLIC_SEND]: { name: 'send-zcoin' },
    [types.ROUTE_TO_PRIVATE_SPEND]: { name: 'spend-zerocoin' },
    [types.ROUTE_TO_SETTINGS]: { name: 'settings' },
    [types.ROUTE_TO_TRANSACTION_LIST]: { name: 'transaction-list'}
}

const buildMutationMap = function (routeMap, router, moduleName) {
    const mutations = {}

    Object.entries(routeMap).forEach(([mutation, route]) => {
        if (!router) {
            mutations[mutation] = function () {}
            return false
        }

        mutations[mutation] = function (state) {
            if (!state.enabledRoutes.includes(`${moduleName}/${mutation}`)) {
                logger.debug('ignoring route action %s %o', mutation, state.enabledRoutes)
                return
            }

            router.push(route)
        }
    })

    return mutations
}

export const setupWindowRouter = function ({ store, router, moduleName = 'Router' }) {
    logger.debug('adding route mutations on store module %s %o', moduleName, routeMap)

    store.registerModule(moduleName, {
        namespaced: true,
        state: {
            enabledRoutes: []
        },
        mutations: {
            [types.SET_ENABLED_ROUTES] (state, routes) {
                logger.info('setting enabled routes %o', routes)
                state.enabledRoutes = routes
            },

            ...buildMutationMap(routeMap, router, moduleName)
        },
        actions: {
            [types.SET_ENABLED_ROUTES] ({ commit }, routes) {
                commit(types.SET_ENABLED_ROUTES, routes)
            }
        },
        getters: {
            isEnabledRoute: (state, type) => state.enabledRoutes.includes(type)
        }
    })
}
