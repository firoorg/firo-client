const HOST = 'tcp://127.0.0.1'

export default {
    // todo remove current network as this originates from apiStatus call now
    currentNetwork: 'testnet',
    secondsToWaitForApiToGetReady: 60,

    main: {
        host: HOST,
        ports: {
            publisher: 18332,
            request: 15557,
            status: 25558
        }
    },
    testnet: {
        host: HOST,
        ports: {
            publisher: 28332,
            request: 25557,
            status: 25558
        }
    },
    regtest: {
        host: HOST,
        ports: {
            publisher: 38332,
            request: 35557,
            status: 25558
        }
    }
}
