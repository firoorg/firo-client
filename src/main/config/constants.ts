// This constant defines the host and ports on which zcoind will be listening in each situation. statusPort will always
// be open, but mainPort, testPort, and regtestPort will only be open in the event zcoind is set to the corresponding
// network type.
export const zcoindAddress = {
    host: '127.0.0.1',
    statusPort: {
        request: 25558,
        publisher: 28333
    },
    mainPort: {
        request: 15557,
        publisher: 18332
    },
    testPort: {
        request: 25557,
        publisher: 28332
    },
    regtestPort: {
        request: 35557,
        publisher: 38332
    }
};