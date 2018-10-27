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
            address: '',
            totalTxFee: 100000
        },
        isLoading: false,
        sendZcoinResponse: {
            _meta: null,
            data: null,
            error: null
        },
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

    AddressValidation: {
        addressToValidate: ''
    },

    Mint: { // daemon: isSubscription
        isLoading: false,
        currentDenominations: {},
        mints: {},
        mintResponse: {
            _meta: null,
            data: null,
            error: null
        }
    },

    ZerocoinSpend: {
        isLoading: false,
        spendForm: {
            label: '',
            mints: {
            },
            address: null
        },
        spendZerocoinResponse: {
            _meta: null,
            data: null,
            error: null
        }
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
        type: 'full',
        averageBlockTime: 0
    },

    Settings: { // daemon: isSubscription
        // blockchainLocation: '~/Library/Application Support/zcoin', // daemon // has, set
        blockchainLocation: '',
        percentageToHoldInZerocoin: 0.5,
        xzcZerocoinRatioNotified: -1,

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

    Znode: {
        znodes: {}
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
        isReady: false,
        showIntroScreen: true,
        clientIsLocked: false,
        lastSeen: {
            paymentRequest: 23345932,
            mint: 23489034
        },
        passphrase: null
    }
}
