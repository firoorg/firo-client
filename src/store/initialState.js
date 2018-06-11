module.exports = {
    Network: {
        height: 0,
        timestamp: 0,
        isConnected: true
    },
    Notification: {
        lastMessage: null,
        lastNotification: null
    },
    Window: {
        welcomeGuide: false,
        settings: false
    },
    PaymentRequest: {
        requests: [
            {
                title: 'label with #hashtags',
                address: 'abc',
                amount: 100,
                created_at: new Date(),
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`,
                isSubscription: false
                // transactions are linked via the address field
            }
        ],
        lastSeen: new Date(), // last visited the tab to validate unseen/seen of a request
        currentPaymentRequest: ''
    },
    Address: {
        addresses: [
            {
                address: 'abc',
                transactions: [
                    {
                        txid: 'txid',
                        timestamp: new Date(),
                        amount: 1000
                    }
                ]
            }
        ]
    },
    Settings: {
        blockchainLocation: ''
    },
    App: {
        showIntroScreen: true,
        other: 1
    }
}
