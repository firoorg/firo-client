// the comment // gui/daemon indicates who is responsible for persisting that particular key-value-pair
module.exports = {
    Network: { // daemon: isSubscription?
        type: 'tor|proxy|direct',
        isConnected: true,
        connectionErrorCode: 0
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
                amount: 100000
            },
            medium: {
                label: 'Medium',
                description: 'take a long walk',
                amount: 50000
            },
            slow: {
                label: 'Slow',
                description: 'sleep over it',
                amount: 10000
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

    Balance: {
        total: {
            all: 0,
            pending: 0,
            available: 0
        },
        xzc: {
            confirmed: 0,
            unconfirmed: 0,
            locked: 0
        },
        zerocoin: {
            confirmed: 0,
            unconfirmed: 0
        }
    },

    Blockchain: { // daemon: isSubscription
        connections: 1,
        currentBlock: {
            height: 0,
            timestamp: 0
        },
        status: {
            isBlockchainSynced: false,
            isFailed: false,
            isSynced: false,
            isWinnersListSynced: false,
            isZnodeListSynced: false
        },
        testnet: true,
        type: 'full'
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
