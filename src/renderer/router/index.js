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
                    path: '/transaction-list',
                    name: 'transaction-list',
                    component: require('@/components/TransactionListPage').default
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
                    path: '/payment',
                    component: require('@/components/OutgoingPaymentsPage').default,
                    props: true,
                    children: [
                        {
                            path: 'send',
                            component: require('@/components/OutgoingPaymentsPage/OutgoingSidebar').default,
                            children: [
                                {
                                    path: ':id',
                                    name: 'public-payment',
                                    component: require('@/components/OutgoingPaymentsPage/OutgoingPaymentDetail').default,
                                    meta: {
                                        isPublic: true
                                    }
                                },
                                {
                                    path: '',
                                    name: 'send-zcoin',
                                    component: require('@/components/OutgoingPaymentsPage/SendZcoin/Send.vue').default,
                                    meta: {
                                        isPublic: true
                                    }
                                }
                            ]
                        },
                        {
                            path: 'spend',
                            component: require('@/components/OutgoingPaymentsPage/OutgoingSidebar').default,
                            children: [
                                {
                                    path: ':id',
                                    name: 'private-payment',
                                    component: require('@/components/OutgoingPaymentsPage/OutgoingPaymentDetail').default,
                                    meta: {
                                        isPublic: false
                                    }
                                },
                                {
                                    path: '',
                                    name: 'spend-zerocoin',
                                    component: require('@/components/OutgoingPaymentsPage/SpendZerocoin/Spend.vue').default,
                                    meta: {
                                        isPublic: false
                                    }
                                }
                            ]
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
            path: '/validate-address',
            component: require('@/layouts/ValidateAddress').default,
            children: [
                {
                    path: '',
                    component: require('@/components/payments/AddressToValidate.vue').default
                }
            ]
        },
        {
            path: '/wait-for-daemon',
            component: require('@/layouts/WaitForDaemon').default
        }
    ]
})
/*,

        // /receive
        {
          path: '/send',
          name: 'send-zcoin',
          component: require('@/components/SendZcoinPage').default
        }
      ]
    },

    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/SettingsPage').default
    },
    {
      path: '/welcome-guide',
      component: require('@/layouts/WelcomeGuideLayout').default,
      props: {
        steps: [
          'welcome',
          'blockchain',
          'blockchain-2',
          'blockchain-3'
        ]
      },
      children: [
        {
          path: '',
          name: 'welcome-guide.welcome',
          component: require('@/components/WelcomeGuide/WelcomePage').default
        },
        {
          path: 'blockchain',
          name: 'welcome-guide.blockchain',
          component: require('@/components/WelcomeGuide/BlockchainPage').default
        },
        {
          path: 'blockchain-2',
          name: 'welcome-guide.blockchain-2',
          component: require('@/components/WelcomeGuide/ZvouchersPage').default
        },
        {
          path: 'blockchain-3',
          name: 'welcome-guide.blockchain-3',
          component: require('@/components/WelcomeGuide/BlockchainPage').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
*/
