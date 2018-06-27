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

    ZcoinPayment: {
        pendingPayments: [],
        selectedFee: 'fast',
        availableFees: {
            fast: {
                label: 'Fast',
                description: 'have a coffee',
                amount: 0.001
            },
            medium: {
                label: 'Medium',
                description: 'take a long walk',
                amount: 0.0005
            },
            slow: {
                label: 'Slow',
                description: 'sleep over it',
                amount: 0.0001
            }
        },
        addPaymentForm: {
            amount: null,
            label: '',
            address: ''
        },
        isLoading: false,
        lastSeen: 'blockHeightAsInteger'
    },

    PaymentRequest: {
        paymentRequests: {
            abc: {
                label: 'label with #hashtags', // deamon // editable
                address: 'abc', // deamon
                amount: 100, // deamon
                created_at: new Date() - (Math.random() * 60000), // daemon
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`, // deamon
                isRecurring: false // gui // editable
                // transactions are linked via the address field
            },
            cba: {
                label: 'other with #hashtags', // deamon // editable
                address: 'cba', // deamon
                amount: 1000, // deamon
                created_at: new Date() - (Math.random() * 30000), // daemon
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`, // deamon
                isRecurring: false // gui // editable
                // transactions are linked via the address field
            },
            mining123: {
                label: '#mining #mining all the time', // deamon // editable
                address: 'mining123', // deamon
                amount: 10, // deamon
                created_at: new Date() - (Math.random() * 10000), // daemon
                message: `Hey Alice, 
                    party was nice yesterday 🎉. do you remember, i borrowed you some money...
                    BestBest
                    Bob`, // deamon
                isRecurring: false // gui // editable
                // transactions are linked via the address field
            }
        },
        isLoading: false,
        createPaymentRequestForm: {
            amount: null,
            label: '',
            message: ''
        },
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
        testnet: true,
        blocks: 84354,
        currentBlock: {
            height: 84350,
            timestamp: new Date()
        },
        connections: 10
    },

    Settings: { // daemon: isSubscription
        // blockchainLocation: '~/Library/Application Support/zcoin', // daemon // has, set
        blockchainLocation: '',
        passphrase: {
            hasPassphrase: true // setPassphrase, verifyPassphrase
        },
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
        },
        b58Prefixes: {
            mainnet: {
                pubkeyAddress: 82, // ['a', 'Z'],
                scriptAddress: 7 // ['3', '4']
            },
            testnet: {
                pubkeyAddress: 65, // ['T'],
                scriptAddress: 178 // ['2']
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
