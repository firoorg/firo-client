import {createRouter, createWebHashHistory} from 'vue-router'

export default new createRouter({
    history: createWebHashHistory(),
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
                    component: require('renderer/components/Setup/LockWallet').default,
                    props: (route) => route.query
                }
            ]
        },

        {
            path: '/main',
            redirect: '/transactions',
            component: require('renderer/layouts/MainLayout').default,
            children: [
                {
                    path: '/transactions',
                    component: require('renderer/components/TransactionsPage').default
                },

                {
                    path: '/send',
                    component: require('renderer/components/SendPage.vue').default
                },

                {
                    path: '/receive',
                    component: require('renderer/components/ReceivePage').default
                },

                {
                    path: '/coinswap',
                    component: require('renderer/components/CoinSwapPage.vue').default,
                },

                {
                    path: '/elysium',
                    component: require('renderer/components/ElysiumPage.vue').default
                },
                
                {
                    path: '/znodes',
                    component: require('renderer/components/MasternodesPage').default
                },

                {
                    path: '/settings',
                    component: require('renderer/components/SettingsPage').default
                },

                {
                    path: '/debugconsole',
                    component: require('renderer/components/DebugConsolePage.vue').default
                },

                {
                    path: '/logconsole',
                    component: require('renderer/components/LogConsolePage.vue').default
                }
            ]
        }
    ]
})
