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
        walletAddresses: {},
        thirdPartyAddresses: {}
    },

    Mint: { // daemon: isSubscription
        currentDenominations: {},
        mints: {}

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

    Clipboard: {
        clipboardValue: '',
        address: null,
        amount: 0,
        message: null,
        timestamp: null,
        notified: false
    },

    App: { // gui
        showIntroScreen: true,
        lastSeen: {
            paymentRequest: 23345932,
            mint: 23489034
        }
    }
}
