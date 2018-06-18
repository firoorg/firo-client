const HOST = 'tcp://127.0.0.1'

export default {
    currentNetwork: 'testnet',

    mainnet: {
        host: HOST,
        ports: {
            publisher: 8451,
            request: 5557
        }
    },
    testnet: {
        host: HOST,
        ports: {
            publisher: 8451,
            request: 15558
        }
    }
}
