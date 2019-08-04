import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/main',
            component: require('@/layouts/MainLayout').default,
            children: [
                {
                    path: '',
                    redirect: { name: 'receive-zcoin' }
                },
                {
                    path: '/receive',
                    component: require('@/components/ReceiveZcoinPage').default,
                    children: [
                        {
                            path: ':paymentRequestId',
                            name: 'receive-zcoin-paymentrequest',
                            component: require('@/components/ReceiveZcoinPage/Receive').default
                        },
                        {
                            path: '',
                            name: 'receive-zcoin',
                            component: require('@/components/ReceiveZcoinPage/Create.vue').default
                        }
                    ]
                },
                {
                    path: '/send',
                    component: require('@/components/SendPage').default,
                    children: [
                        {
                            path: 'private'
                        },

                        {
                            path: 'public'
                        }
                    ]
                },
                {
                    path: '/mint',
                    name: 'mint-zerocoin',
                    component: require('@/components/MintZerocoinPage').default
                },
                {
                    path: '/znode',
                    name: 'znode',
                    component: require('@/components/ZnodePage').default
                },
                {
                    path: '/settings',
                    name: 'settings',
                    component: require('@/components/SettingsPage').default
                }
            ]
        },
        {
            path: '/wait-for-daemon',
            component: require('@/layouts/WaitForDaemon').default
        }
    ]
})