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
                    component: require('@/components/PaymentsPage').default,
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
                        },

                        {
                            path: '/mint-info/:blockHeight',
                            component: require('@/components/PaymentSidebars/MintInfo').default
                        }
                    ]
                },

                {
                    path: '/anonymize',
                    component: require('@/components/AnonymizePage').default
                },

                {
                    path: '/znodelist',
                    component: require('@/components/ZnodePage').default
                },

                {
                    path: '/settings',
                    component: require('@/components/SettingsPage').default
                },

                {
                    path: '/debugconsole',
                    component: require('@/components/DebugPage').default
                }
            ]
        }
    ]
})