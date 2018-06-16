import electron from 'electron'
const dialog = electron.dialog

export const selectDirectory = function (window) {
    dialog.showOpenDialog(window, {
        properties: ['openDirectory']
    })
}
