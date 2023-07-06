import CryptoJS from 'crypto-js';


const tryCall = (call, fallbackValue) => {
    try {
        return call()
    } catch (error) {
        //Do Nothing
    }
    return fallbackValue
}

export const useIpcRenderer = () => {
    return tryCall(() => (electronAPI.ipcRenderer), null)
}

export const isMacOS = () => {
    return tryCall(() => (electronAPI.isMacOS), null)
}

export const isWinOS = () => {
    return tryCall(() => (electronAPI.isWinOS), null)
}

export const useUseCustomTrafficLight = () => {
    return tryCall(() => (electronAPI.useCustomTrafficLight), false)
}

export const isDevEnv = () => {
    return tryCall(() => (electronAPI.isDevEnv), null)
}