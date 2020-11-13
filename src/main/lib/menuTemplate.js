export default [
    ...(process.platform === 'darwin' ? [{
        label: 'Firo Client',
        submenu: [
            {role: 'about', label: 'About Firo Client'},
            {role: 'hide', label: 'Hide Firo Client'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit', label: 'Quit Firo Client'}
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
