export default {
    protocolIdentifier: 'zcoin',
    core: {
        autoRestart: true,
        stopOnQuit: true,
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
