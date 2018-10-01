const HOST = 'tcp://127.0.0.1'

export default {
    secondsToWaitForApiToGetReady: 60,

    status: {
        host: HOST,
        port: 25558
    },

    networks: {
        main: {
            host: HOST,
            ports: {
                publisher: 18332,
                request: 15557
            }
        },
        test: {
            host: HOST,
            ports: {
                publisher: 28332,
                request: 25557
            }
        },
        regtest: {
            host: HOST,
            ports: {
                publisher: 38332,
                request: 35557
            }
        }
    }
}
