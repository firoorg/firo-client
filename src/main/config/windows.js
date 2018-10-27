export default {
    main: {
        url: 'main',
        show: true,
        window: {
            useContentSize: true,
            titleBarStyle: 'hiddenInset',
            height: 750,
            width: 1930
        }
    },
    validateAddress: {
        url: 'validate-address',
        show: true,
        window: {
            // parent: 'main',
            backgroundColor: '#1F1F2E',
            center: true,
            maximizable: false,
            fullscreenable: false,
            titleBarStyle: 'hiddenInset',
            alwaysOnTop: true,
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
    }
}
