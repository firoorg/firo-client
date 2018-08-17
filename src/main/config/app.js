export default {
    protocolIdentifier: 'zcoin',
    core: {
        autoRestart: true,
        stopOnQuit: false,
        heartbeatIntervalInSeconds: 1
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
