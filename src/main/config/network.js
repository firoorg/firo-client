const HOST = 'tcp://127.0.0.1'

export default {
    currentNetwork: 'testnet',
    secondsToWaitForApiToGetReady: 60,

    mainnet: {
        host: HOST,
        ports: {
            publisher: 18332,
            request: 5557,
            status: 5558
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
            publisher: 38332
        }
    }
}
