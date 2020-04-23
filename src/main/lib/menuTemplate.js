export default [
    ...(process.platform === 'darwin' ? [{
        label: 'Zcoin Client',
        submenu: [
            {role: 'about', label: 'About Zcoin Client'},
            {role: 'hide', label: 'Hide Zcoin Client'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit', label: 'Quit Zcoin Client'}
        ]
    }] : []),

    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    },

    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'forcereload'},
            {role: 'toggledevtools'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {role: 'togglefullscreen'}
        ]
    },

    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'},
            ...(process.platform === 'darwin' ? [
                {role: 'zoom'},
                {type: 'separator'},
                {role: 'front'}
            ] : [])
        ]
    }
];
