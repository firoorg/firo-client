import * as types from '~/types/Router'
import Debug from 'debug'

const debug = Debug('zcoin:store.routeHelper')

const routeMap = {
    [types.ROUTE_TO_CREATE_PAYMENT_REQUEST]: { name: 'receive-zcoin' },
    [types.ROUTE_TO_PUBLIC_SEND]: { name: 'send-zcoin' },
    [types.ROUTE_TO_PRIVATE_SPEND]: { name: 'spend-zerocoin' },
    [types.ROUTE_TO_SETTINGS]: { name: 'settings' }
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
                debug('ignoring route action %s %o', mutation, state.enabledRoutes)
                return
            }

            debug('routing to %o, via mutation %s, %o', route, mutation, state.enabledRoutes)
            router.push(route)
        }
    })

    return mutations
}

export const setupWindowRouter = function ({ store, router, moduleName = 'Router' }) {
    debug('adding route mutations on store module %s %o', moduleName, routeMap)

    store.registerModule(moduleName, {
        namespaced: true,
        state: {
            enabledRoutes: []
        },
        mutations: {
            [types.SET_ENABLED_ROUTES] (state, routes) {
                debug('setting enabled routes %o', routes)
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
