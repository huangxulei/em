const { opendirSync, readFileSync, statSync, writeFileSync, readdirSync } = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const MusicMetadata = require('music-metadata');
const { AUDIO_EXTS } = require('./env');

const FILE_PREFIX = 'file:///'
const IMAGE_PROTOCAL = {
    scheme: 'lessimage',
    prefix: 'lessimage://',
}

const ALPHABET_NUMS = 'ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz01234567890'

const nextInt = (max) => {
    const limit = max < 1024 ? 1024 : max
    return parseInt(Math.random() * limit) % max
}

function MD5(text) {
    return text ? CryptoJS.MD5(text).toString() : null
}

function SHA1(text) {
    return text ? CryptoJS.SHA1(text).toString() : null
}


/** 随机字符串
 * @param src 限定组成元素的字符串，如：ABCDEFGHIJKLMNOPQRSTUVWSYZ
 * @param len 长度
 */
const randomText = (src, len) => {
    let result = []
    for (let i = 0; i < len; i++) {
        const index = Math.floor(Math.random() * (src.length - 1))
        result.push(src.charAt(index))
    }
    return result.join('')
}

/** 随机字符串: 大小写字母和数字组成 */
const randomTextWithinAlphabetNums = (len) => {
    return randomText(ALPHABET_NUMS + ALPHABET_NUMS + ALPHABET_NUMS, len)
}

const transformPath = (path) => {
    try {
        return path.replace(FILE_PREFIX, '')
            .replace(/\\/g, '/')
            .replace(/\/\//g, '').trim()
    } catch (error) {
        console.log(error)
    }
    return path
}

function getSimpleFileName(fullname) {
    if (!fullname) return ''
    fullname = transformPath(fullname)
    const from = fullname.lastIndexOf('/')
    let to = fullname.lastIndexOf('.')
    to = to >= 0 ? to : fullname.length
    return fullname.substring(from + 1, to)
}


/**
 * 遍历当前目录全部文件，包括子目录
 */
const walkSync = (dir, callback, options) => {
    try {
        options = options || { deep: false }
        readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
            var pathName = path.join(dir, dirent.name);
            if (dirent.isFile()) {
                callback(pathName, dirent);
            } else if (dirent.isDirectory() && options.deep) {
                walkSync(pathName, callback, options);
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const isExtentionValid = (name, exts) => {
    for (var ext of exts) {
        if (name && name.endsWith(ext)) {
            return true
        }
    }
    return false
}

async function parseTracks(audioFiles) {
    const tracks = []
    for (const file of audioFiles) {
        try {
            if (!isExtentionValid(file, AUDIO_EXTS)) continue
            const track = await createTrackFromMetadata(file)
            if (track) {
                const index = tracks.findIndex(item => track.id == item.id)
                if (index == -1) tracks.push(track)
            }
        } catch (error) {
            console.log(error)
        }
    }
    return tracks
}

const scanDirTracks = async (dir, exts, deep) => {
    try {
        if (!exts || exts.length < 1) exts = AUDIO_EXTS
        const result = { path: dir, data: [], name: getSimpleFileName(dir) }
        const files = []
        walkSync(dir, (file, dirent) => {
            if (dirent.isFile() && isExtentionValid(dirent.name, exts)) {
                files.push(transformPath(file))
            }
        }, { deep })
        if (files.length > 0) {
            const tracks = await parseTracks(files.sort())
            result.data.push(...tracks)
        }
        return result
    } catch (error) {
        console.log(error);
        return null
    }
}

module.exports = {
    randomText,
    randomTextWithinAlphabetNums,
    FILE_PREFIX,
    IMAGE_PROTOCAL,
    ALPHABET_NUMS,
    nextInt,
    MD5,
    SHA1,
    scanDirTracks
}