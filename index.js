const { app, BrowserWindow, ipcMain, dialog, Notification, Menu, shell } = require('electron')
const path = require("path")
const fs = require("fs")

require("electron-reloader")(module)
//"run npm install electron-reloader -D" to install the reloader package
//To update the changes in the application without quiting and rerunning the "npm start" command

app.disableHardwareAcceleration()

let appWindow;
let fileOpenPath;

function createWindows() {
    appWindow = new BrowserWindow({
        width: 1224,
        height: 768,
        center: true,
        // frame: true,
        // movable: false,
        resizable: true,
        minHeight: 600,
        minWidth: 800,
        show: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), "renderer.js"),
            spellcheck: false
        },
        icon: "./icon.png"
    })
    appWindow.setMenuBarVisibility(true)
    appWindow.loadFile('./index.html')
    appWindow.on('closed', () => {
        appWindow = null
    })

    appWindow.webContents.openDevTools()

    appWindow.once('ready-to-show', () => {
        appWindow.show()
    })
}

app.on('ready', createWindows)

/* const handleError = () => {
    new Notification({
        title: "Error",
        body: "Sonething went wrong",
    }).show()
} */

ipcMain.on("create-file-clicked", () => {
    dialog.showSaveDialog(appWindow, {
        filters: [{ name: "text and log files", extensions: ["txt", "log"] }]
    }).then(({ filePath }) => {
        //console.log('file path', filePath)
        fs.writeFile(filePath, "", (error) => {
            if (error) {
                console.log("Error while creating file")
            }
            else {
                fileOpenPath = filePath
                appWindow.webContents.send("file-created", filePath)
            }
        })
    })
})

ipcMain.on("open-file-clicked", () => {
    dialog.showOpenDialog({
        filters: [{ name: "text and log files", extensions: ["txt", "log"] }],
        properties: ["openFile"]
    }).then(({ filePaths }) => {
        const filePath = filePaths[0]
        //fileOpenPath = filePath
        fs.readFile(filePath, "utf-8", (error, content) => {
            if (error) {
                console.log('Error while opening file')
            }
            else {
                fileOpenPath = filePath
                appWindow.webContents.send("document-opened", { filePath, content })
            }
        })
    })
})

ipcMain.on("file-updated", (_, textareaContent) => {
    fs.writeFile(fileOpenPath, textareaContent, (error) => {
        if (error) {
            console.log("Error while updating file")
        }
    })
})