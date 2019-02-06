const overlayWindow = {
    backgroundColor: '#1F1F2E',
    center: true,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hiddenInset',
    alwaysOnTop: true
}

export default {
    main: {
        url: 'main',
        show: false,
        window: {
            useContentSize: true,
            titleBarStyle: 'hiddenInset',
            height: 750,
            width: 1400,
            minWidth: 1200,
            minHeight: 450
        }
    },
    validateAddress: {
        url: 'validate-address',
        show: false,
        window: {
            ...overlayWindow,
            minWidth: 440,
            minHeight: 100,
            width: 800,
            height: 140,
            aspectRatio: 5.7
        }
    },
    welcomeGuide: {
        url: 'welcome-guide',
        show: false,
        window: {
            parent: 'main',
            center: true,
            modal: false
        }
    },
    settings: {
        url: 'settings',
        show: false,
        window: {
            parent: 'main',
            modal: true,
            backgroundColor: '#1F1F2E',
            useContentSize: true
        }
    },
    waitForDaemonShutdown: {
        url: 'wait-for-daemon',
        show: false,
        window: {
            ...overlayWindow,
            width: 350,
            height: 350,
            resizable: false,
            minimizable: false,
            maximizable: false,
            closable: false,
            aspectRatio: 1
        }
    }
}
