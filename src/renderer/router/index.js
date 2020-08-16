import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/setup',
            component: require('renderer/layouts/SetupLayout').default,
            children: [
                {
                    path: 'welcome',
                    component: require('renderer/components/Setup/Welcome').default
                },

                {
                    path: 'select-blockchain-location',
                    component: require('renderer/components/Setup/SelectBlockchainLocation').default
                },

                {
                    path: 'select-create-or-restore',
                    component: require('renderer/components/Setup/SelectCreateOrRestore').default
                },

                {
                    path: 'write-down-mnemonic',
                    component: require('renderer/components/Setup/WriteDownMnemonic').default
                },

                {
                    path: 'confirm-mnemonic',
                    component: require('renderer/components/Setup/ConfirmMnemonic').default
                },

                {
                    path: 'recover-from-mnemonic',
                    component: require('renderer/components/Setup/RecoverFromMnemonic').default
                },

                {
                    path: 'lock-wallet',
                    component: require('renderer/components/Setup/LockWallet').default
                }
            ]
        },

        {
            path: '/main',
            component: require('renderer/layouts/MainLayout').default,
            // fixme: It would be cleaner if we started pointing to / instead of /main.
            redirect: '/receive',
            children: [
                {
                    path: 'transaction-page',
                    component: require('renderer/components/PaymentsPage').default,
                    children: [
                        {
                            path: '/send',
                            component: require('renderer/components/PaymentSidebars/Send').default,
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
                            component: require('renderer/components/PaymentSidebars/Receive').default
                        },

                        {
                            path: '/payment-request/:uniqId',
                            component: require('renderer/components/PaymentSidebars/PaymentRequest').default
                        },

                        {
                            path: '/transaction-info/:uniqId',
                            component: require('renderer/components/PaymentSidebars/TransactionInfo').default
                        },

                        {
                            path: '/mint-info/:blockHeight',
                            component: require('renderer/components/PaymentSidebars/MintInfo').default
                        }
                    ]
                },

                {
                    path: '/anonymize',
                    component: require('renderer/components/AnonymizePage').default
                },

                {
                    path: '/znodes',
                    component: require('renderer/components/EvoZnodesContainer').default
                },

                {
                    path: '/znodelist',
                    component: require('renderer/components/ZnodePage').default
                },

                {
                    path: '/settings',
                    component: require('renderer/components/SettingsPage').default
                },

                {
                    path: '/debugconsole',
                    component: require('renderer/components/DebugPage').default
                }
            ]
        }
    ]
})
