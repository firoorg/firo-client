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
                    name: 'home',
                    component: require('@/components/TestPage').default
                },
                {
                    path: '/receive',
                    component: require('@/components/ReceiveZcoinPage').default,
                    children: [
                        {
                            path: ':address',
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
                    name: 'send-zcoin',
                    component: require('@/components/SendZcoinPage').default
                },
                {
                    path: '/mint',
                    name: 'mint-zerocoin',
                    component: require('@/components/MintZerocoinPage').default
                }
            ]
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
