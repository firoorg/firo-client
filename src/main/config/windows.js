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
