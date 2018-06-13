// the comment // gui/daemon indicates who is responsible for persisting that particular key-value-pair
module.exports = {
    Network: {
        height: 0,
        timestamp: 0,
        isConnected: true // gui
    },
    Notification: {
        lastMessage: null, // gui
        lastNotification: null // gui
    },
    Window: {
        welcomeGuide: false, // gui
        settings: false // gui
    },
    PaymentRequest: {
        requests: [
            {
                title: 'label with #hashtags', // deamon
                address: 'abc', // deamon
                amount: 100, // deamon
                created_at: new Date(), // daemon
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`, // deamon
                isSubscription: false // gui
                // transactions are linked via the address field
            }
        ],
        lastSeen: new Date(), // gui // last visited the tab to validate unseen/seen of a request
        currentPaymentRequest: '' // gui
    },
    Address: {
        addresses: [
            {
                address: 'abc', // daemon
                transactions: [
                    {
                        txid: 'txid', // daemon
                        timestamp: new Date(), // daemon
                        amount: 1000 // daemon
                    }
                ]
            }
        ]
    },
    Settings: {
        blockchainLocation: '' // daemon
    },
    App: {
        showIntroScreen: true, // gui
        other: 1
    }
}
