const HOST = 'tcp://127.0.0.1'

export default {
    currentNetwork: 'testnet',

    mainnet: {
        host: HOST,
        ports: {
            publisher: 8451,
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
    }
}
