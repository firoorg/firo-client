export default {
    protocolIdentifier: 'zcoin',
    core: {
        autoRestart: false,
        stopOnQuit: true, // process.env.NODE_ENV === 'production',
        heartbeatIntervalInSeconds: 5
    },
    folders: {
        encryption: {
            root: 'certificates',
            client: 'client',
            server: 'server',
            fileName: 'keys.json'
        }
    }
}
