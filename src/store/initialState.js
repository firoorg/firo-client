// the comment // gui/daemon indicates who is responsible for persisting that particular key-value-pair
module.exports = {
    Network: { // daemon: isSubscription?
        type: 'tor|proxy|direct',
        isConnected: true
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
                label: 'label with #hashtags', // deamon // editable
                address: 'abc', // deamon
                amount: 100, // deamon
                created_at: new Date(), // daemon
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`, // deamon
                isRecurring: false // gui // editable
                // transactions are linked via the address field
            }
        ],
        lastSeen: 'blockHeightAsInteger', // gui // last visited the tab to validate unseen/seen of a request
        currentPaymentRequest: '' // gui // payment request showed in detail
    },

    Address: { // daemon: isSubscription
        addresses: [
            {
                address: 'abc', // daemon
                transactions: [
                    {
                        txid: 'txid', // daemon
                        timestamp: new Date(), // daemon
                        amount: 1000, // daemon
                        type: 'in|out|mint|spend|newcoin', // daemon
                        confirmations: 1 // daemon
                    }
                ]
            }
        ]
    },

    Mint: { // daemon: isSubscription
        mints: [
            {
                mintid: '',
                created_at: new Date(),
                value: 25,
                isUsed: false
            }
        ]
    },

    Blockchain: { // daemon: isSubscription
        // we could add this later when we provide a separate electrumX blockchain connector in the future
        type: 'full|light',

        // we need to clarify status types. e.g. is isSynced === isFailed possible?
        status: {
            IsBlockchainSynced: true,
            IsZnodeListSynced: true,
            IsWinnersListSynced: true,
            IsSynced: true,
            IsFailed: false
        },
        attempt: 0,
        testnet: false,
        blocks: 84354,
        currentBlock: {
            height: 84350,
            timestamp: new Date()
        },
        connections: 10
    },

    Settings: { // daemon: isSubscription
        blockchainLocation: '', // daemon
        confirmationsRequired: 6,
        network: {
            upnp: true,
            allowIncominConnections: true,
            proxy: {
                enabled: false,
                ip: '127.0.0.1',
                port: 9050
            },
            tor: {
                enabled: true,
                proxy: {
                    enabled: false,
                    ip: '127.0.0.1',
                    port: 9050
                }
            }
        }
    },

    App: { // gui
        showIntroScreen: true,
        lastSeen: {
            paymentRequest: 23345932,
            mint: 23489034
        }
    }
}
