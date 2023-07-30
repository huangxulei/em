const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron')
const { isMacOS, isWinOS, useCustomTrafficLight, isDevEnv, USER_AGENTS, AUDIO_EXTS, IMAGE_EXTS,
    APP_ICON, AUDIO_PLAYLIST_EXTS, BACKUP_FILE_EXTS } = require('./env')
const { randomTextWithinAlphabetNums, nextInt, MD5, SHA1 } = require('./common')
const path = require('path')
//显示模式 默认/简单(小屏幕)
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
    })
    app.on('activate', (event) => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWin = createMainWindow()
        }
        sendToRenderer('app-active')//给渲染经常发送
    })

    app.on('did-become-active', (event) => {
        sendToRenderer('app-active')
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', (event) => {
        if (!isDevEnv || !isMacOS) app.quit()
    })

    app.on('before-quit', (event) => {
        cleanupBeforeQuit()
        sendToRenderer('app-quit')
    })
}

const createMainWindow = () => {
    //从设置中获取宽高 
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

    mainWindow.once('ready-to-show', () => {
        setWindowButtonVisibility(!useCustomTrafficLight)
        mainWindow.show()
    })

    //配置请求过滤
    const filter = {
        urls: [
            "*://*.qq.com/*",
            "*://music.163.com/*",
            "*://*.126.net/*",
            "*://*.kuwo.cn/*",
            "*://*.kugou.com/*",
            "*://*.douban.com/*",
            "*://*.doubanio.com/*",
            "*://*.ridio.cn/*",
            "*://*.cnr.cn/*",
            "*://*.qingting.fm/*",
            "*://*.qtfm.cn/*",
            "*://*/*"
        ]
    }

    const { webRequest } = mainWindow.webContents.session
    webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        const { requestHeaders } = overrideRequest(details)
        callback({ requestHeaders })
    })
    mainWindow.webContents.on('found-in-page', (event, result) => {
        if (result.finalUpdate) mainWindow.webContents.stopFindInPage('clearSelection')
    })

    return mainWindow
}
//electron 主进程中通过window.webContents.send向渲染进程发送消息
const sendToRenderer = (channel, args) => {
    try {
        if (mainWin && mainWin.webContents) mainWin.webContents.send(channel, args)
    } catch (error) {
        if (isDevEnv) console.log(error)
    }
}

//TODO 托盘动作 根据action参数 进行操作
const sendTrayAction = (action, showWin) => {
    if (mainWin && showWin) mainWin.show()
    sendToRenderer('tray-action', action)
}

//托盘初始化
const initTrayMenuTemplate = () => {
    const template = [
        {
            label: '听你想听，爱你所爱',
            click: () => {
                sendTrayAction(-1, true)
            }
        }, {
            type: 'separator'
        }, {
            label: '播放 / 暂停',
            click: () => sendTrayAction(1)
        }, {
            label: '上一曲',
            click: () => sendTrayAction(2)
        }, {
            label: '下一曲',
            click: () => sendTrayAction(3)
        }, {
            type: 'separator'
        }, {
            label: '我的主页',
            click: () => {
                sendTrayAction(5, true)
            }
        }, {
            label: '设置',
            click: () => {
                sendTrayAction(6, true)
            }
        }, {
            type: 'separator'
        }, {
            label: "退出",
            role: "quit"
        }
    ]
    return template
}

//在菜单栏显示 托盘初始化
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
    console.log(locale)
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
    let menuItems = [
        { role: 'about', label: menuText.about },
        { role: 'toggleDevTools', label: menuText.devTools },
        { role: 'quit', label: menuText.quit },
    ]
    if (!isDevEnv) menuItems.splice(1, 1)
    const appName = app.name.replace('-', '')
    const template = [
        ...[
            {
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
            }
        ]
    ]
    return template
}

const registryGlobalListeners = () => {
    ipcMain.on('app-quit', () => {//关闭
        if (isDevEnv || isMacOS) {
            mainWin.close()
            return
        }
        cleanupBeforeQuit()
        app.quit()
    }).on('app-min', (event, isHideToTray) => {//最小化
        if (isHideToTray) {//是否隐藏到托盘
            if (isMacOS) app.hide()
            else mainWin.hide()
            setupTray(true)//托盘初始化
            return
        }
        if (mainWin.isFullScreen()) mainWin.setFullScreen(false)
        if (mainWin.isMaximized() || mainWin.isNormal()) mainWin.minimize()
    }).on('app-max', () => {//最大化
        let isFullScreen = false
        if (isWinOS) {
            isFullScreen = toggleWinOSFullScreen()
        } else {
            isFullScreen = !mainWin.isFullScreen()
            mainWin.setFullScreen(isFullScreen)
        }
        sendToRenderer('app-max', isFullScreen)
    }).on('app-tray', (e, isShow) => {
        setupTray(isShow)
    }).on('app-zoom', (e, { zoom, noResize }) => {
        setupAppWindowZoom(zoom, noResize)
    })
}

const setupAppWindowZoom = (zoom, noResize) => {
    if (!mainWin || !zoom) return
    zoom = Number(zoom) || 85
    const zoomFactor = parseFloat(zoom / 100)
    if (zoomFactor < 0.5 || zoomFactor > 3) return
    mainWin.webContents.setZoomFactor(zoomFactor)
    const { appWidth, appHeight } = appLayoutConfig[appLayout]
    const width = parseInt(appWidth * zoomFactor)
    const height = parseInt(appHeight * zoomFactor)
    mainWin.setMinimumSize(width, height)
    if (noResize) return
    if (mainWin.isNormal()) {
        mainWin.setSize(width, height)
        mainWin.center()
    }
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

const cancelDownload = () => {
    if (downloadingItem) {
        downloadingItem.cancel()
        downloadingItem = null
    }
}

const cleanupBeforeQuit = () => {
    cancelDownload()
}

//设置系统交通灯按钮可见性
const setWindowButtonVisibility = (visible) => {
    if (!isMacOS) return
    try {
        if (mainWin) mainWin.setWindowButtonVisibility(visible)
    } catch (error) {
        if (isDevEnv) console.log(error)
    }
}


//覆盖(包装)请求
const overrideRequest = (details) => {
    let origin = null
    let referer = null
    let cookie = null
    let userAgent = null
    let xrouter = null
    let csrf = null
    let cross = null

    const { url } = details
    if (url.includes("qq.com")) {
        origin = "https://y.qq.com/"
        referer = origin
    } else if (url.includes("163.com") || url.includes("126.net")) {
        origin = "https://music.163.com/"
        referer = origin
        //if(url.includes("/dj/program/listen")) referer = null
    } else if (url.includes("u6.kuwo.cn")) {
        userAgent = 'fm 7010001}(android 7.1.2)'
        cookie = ''
        //referer = 'https://www.kuwo.cn/'
    } else if (url.includes("kuwo")) {
        const kw_token = randomTextWithinAlphabetNums(10).toUpperCase()
        //const hm_token = 'JBKeCaitKM6jTWMfdef4kJMF2BBf4T3z'
        const hm_token = randomTextWithinAlphabetNums(32).toUpperCase()
        origin = "https://www.kuwo.cn/"
        referer = origin
        // cookie = "Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1651222601; _ga=GA1.2.1036906485.1647595722; kw_token=" + csrf
        cookie = `kw_token=${kw_token};Hm_token=${hm_token}`
        cross = MD5(SHA1(hm_token).toLowerCase()).toLowerCase()
    } else if (url.includes("kugou")) {
        origin = "https://www.kugou.com/"
        referer = origin
        if (url.includes("mac.kugou.com")) userAgent = USER_AGENTS[0]
        if (url.includes("&cmd=123&ext=mp4&hash=")) xrouter = 'trackermv.kugou.com'
    } else if (url.includes("douban")) {
        const bid = randomTextWithinAlphabetNums(11)
        origin = "https://fm.douban.com/"
        referer = origin
        cookie = "bid=" + bid
        //cookie = 'bid=' + bid + '; __utma=30149280.1685369897.1647928743.1648005141.1648614477.3; __utmz=30149280.1648005141.2.2.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _pk_ref.100001.f71f=%5B%22%22%2C%22%22%2C1650723346%2C%22https%3A%2F%2Fmusic.douban.com%2Ftag%2F%22%5D; _pk_id.100001.f71f=5c371c0960a75aeb.1647928769.4.1650723346.1648618102.; ll="118306"; _ga=GA1.2.1685369897.1647928743; douban-fav-remind=1; viewed="2995812"; ap_v=0,6.0'
    } else if (url.includes("radio.cn") || url.includes("cnr.cn")) {
        origin = "http://www.radio.cn/"
        referer = origin
    } else if (url.includes("qingting") || url.includes("qtfm.cn")) {
        origin = "https://www.qingting.fm/"
        referer = origin
    } else if (url.includes("ximalaya")) {
        origin = " https://www.ximalaya.com/"
        referer = origin
    }

    //默认Referer
    if (!referer) {
        const urlParts = url.split('://')
        const scheme = urlParts[0]
        const host = urlParts[1].split('/')[0]
        referer = `${scheme}://${host}/`
    }

    /*
    details.requestHeaders['Access-Control-Allow-Headers'] = "Origin, X-Requested-With, Content-Type, Accept"
    details.requestHeaders['Access-Control-Allow-Origin'] = "*"
    */

    //if(origin) details.requestHeaders['Origin'] = origin
    if (userAgent) details.requestHeaders['User-Agent'] = userAgent
    if (referer) details.requestHeaders['Referer'] = referer
    if (cookie) details.requestHeaders['Cookie'] = cookie
    if (xrouter) details.requestHeaders['x-router'] = xrouter
    if (csrf) details.requestHeaders['CSRF'] = csrf
    if (cross) details.requestHeaders['Cross'] = cross

    return details
}
//启动应用
startup()