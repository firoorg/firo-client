import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '',
            redirect: '/receive'
        },

        {
            path: '/main',
            component: require('@/layouts/MainLayout').default,
            // fixme: It would be cleaner if we started pointing to / instead of /main.
            redirect: '/receive',
            children: [
                {
                    path: 'transaction-page',
                    component: require('@/components/TransactionsPage').default,
                    children: [
                        {
                            path: '/send',
                            component: require('@/components/PaymentSidebars/Send').default,
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
                            path: '/receive',
                            component: require('@/components/PaymentSidebars/CreatePaymentRequest').default
                        },

                        {
                            path: '/payment-request/:uniqId',
                            component: require('@/components/PaymentSidebars/PaymentRequest').default
                        },

                        {
                            path: '/transaction-info/:uniqId',
                            component: require('@/components/PaymentSidebars/TransactionInfo').default
                        }
                    ]
                },

                {
                    path: '/mint',
                    component: require('@/components/MintZerocoinPage').default
                },

                {
                    path: '/znodelist',
                    component: require('@/components/ZnodePage').default
                },

                {
                    path: '/settings',
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