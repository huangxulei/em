const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const { isMacOS, isWinOS, useCustomTrafficLight, isDevEnv, USER_AGENTS, AUDIO_EXTS, IMAGE_EXTS,
    APP_ICON, AUDIO_PLAYLIST_EXTS, BACKUP_FILE_EXTS } = require('./env')
const { nextInt } = require('./common')
const path = require('path')

const DEFAULT_LAYOUT = 'default', SIMPLE_LAYOUT = 'simple'
const appLayoutConfig = {
    'default': {
        appWidth: 1080,
        appHeight: 720
    },
    'simple': {
        appWidth: 500,
        appHeight: 588
    }
}

let mainWin = null, appLayout = DEFAULT_LAYOUT
let appTray = null
//TODO 下载队列
let downloadingItem = null

/* 自定义函数 */
const startup = () => {
    init()
    registryGlobalListeners()
}

const init = () => {
    app.whenReady().then(() => {
        //全局UserAgent
        app.userAgentFallback = USER_AGENTS[nextInt(USER_AGENTS.length)]
        mainWin = createMainWindow()

        app.on('activate', (event) => {
            if (BrowserWindow.getAllWindows().length === 0) {
                mainWin = createMainWindow()
            }
        })
        app.on('window-all-closed', (event) => {
            if (!isDevEnv || !isMacOS) app.quit()
        })
    })
}

const createMainWindow = () => {
    const { appWidth: width, appHeight: height } = appLayoutConfig[appLayout]
    const mainWindow = new BrowserWindow({
        width,
        height,
        minWidth: width,
        minHeight: height,
        titleBarStyle: 'hidden',
        transparent: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            //nodeIntegrationInWorker: true,
            webSecurity: false  //TODO 有风险，暂时保留此方案，留待后期调整
        }
    })
    if (isDevEnv) {
        mainWindow.loadURL("http://localhost:2000/")
        //打开DevTools
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile('dist/index.html')
    }
}

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin && mainWin.webContents) mainWin.webContents.send(channel, args)
    } catch (error) {
        if (isDevEnv) console.log(error)
    }
}

//TODO 
const sendTrayAction = (action, showWin) => {
    if (mainWin && showWin) mainWin.show()
    sendToRenderer('tray-action', action)
}


//在菜单栏显示
const setupTray = (isShow) => {
    if (isShow) {
        if (appTray) appTray.destroy()
        appTray = new Tray(path.join(__dirname, APP_ICON))
        appTray.setContextMenu(Menu.buildFromTemplate(initTrayMenuTemplate()))
    } else if (appTray) {
        appTray.destroy()
        appTray = null
    }
}

//菜单模板
const initAppMenuTemplate = () => {
    const locale = app.getLocale()
    const TEXT_CONFIG = {
        'en-US': {
            about: 'About',
            devTools: 'Developer Tools',
            quit: 'Quit',
            edit: 'Edit'
        },
        'zh-CN': {
            about: '关于',
            devTools: '开发者工具',
            quit: '退出',
            edit: '编辑'
        }
    }
    const menuText = TEXT_CONFIG[locale] || TEXT_CONFIG['zh-CN']
    let menuItems = [{ role: 'about', label: menuText.about },
    { role: 'toggleDevTools', label: menuText.devTools },
    { role: 'quit', label: menuText.quit },]
    if (!isDevEnv) menuItems.splice(1, 1)
    const appName = app.name.replace('-', '')
    const template = [
        ...[{
            label: appName,
            submenu: menuItems,
        }, {
            label: menuText.edit,
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ]
        }]
    ]
    return template
}
const registryGlobalListeners = () => {
    ipcMain.on('app-quit', () => {
        if (isDevEnv || isMacOS) {
            mainWin.close()
            return
        }
        app.quit()
    }).on('app-min', (event, isHideToTray) => {
        if (isHideToTray) {
            if (isMacOS) app.hide()
            else mainWin.hide()
            setupTray(true)
            return
        }
        if (mainWin.isFullScreen()) mainWin.setFullScreen(false)
        if (mainWin.isMaximized() || mainWin.isNormal()) mainWin.minimize()
    }).on('app-max', () => {
        let isFullScreen = false
        if (isWinOS) {
            isFullScreen = toggleWinOSFullScreen()
        }
    })
}

const toggleWinOSFullScreen = () => {
    if (!mainWin || !isWinOS) return null
    const isMax = mainWin.isMaximized()
    if (isMax) {
        mainWin.unmaximize()
    } else {
        mainWin.maximize()
    }
    return !isMax
}

//启动应用
startup()