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

async function createTrackFromMetadata(file) {
    file = transformPath(file)
    const statResult = statSync(file, { throwIfNoEntry: false })
    if (!statResult) return null

    const metadata = await MusicMetadata.parseFile(file, { duration: true })
    const artist = []
    let filename = getSimpleFileName(file)
    const album = { id: 0, name: '' }
    //let coverData = 'default_cover.png'
    let title = null, duration = 0, lyricText = null, publishTime = null
    try {
        if (metadata.common) {
            const { title: mTitle, artist: mArtist, artists, album: mAlbum, picture, lyrics,
                year: mYear, date: mDate, originaldate } = metadata.common
            //歌曲名称
            if (mTitle) title = mTitle.trim()
            //歌手、艺人
            if (artists) {
                if (artists.length > 1) {
                    artists.forEach(ar => artist.push({ id: 0, name: ar }))
                } else { //异常格式
                    artists.forEach(ar => {
                        const delimiter = '、'
                        const names = ar.replace(/[\/&，,\|\\]/g, delimiter).split(delimiter)
                        names.forEach(name => {
                            artist.push({ id: 0, name })
                        })
                    })
                }
            }
            //专辑名称
            if (mAlbum) Object.assign(album, { id: 0, name: mAlbum })
            //封面
            //const cover = MusicMetadata.selectCover(picture)
            //直接返回内容数据，太耗内存
            //if (cover) coverData = `data:${cover.format};base64,${cover.data.toString('base64')}`

            //内嵌歌词
            if (lyrics && lyrics.length > 0) lyricText = lyrics[0]

            //发布时间
            if (originaldate) publishTime = originaldate
            if (!publishTime && mDate) publishTime = mDate
            if (!publishTime && mYear) publishTime = mYear
        }
        if (metadata.format) {
            const { duration: mDuration } = metadata.format
            if (mDuration) duration = mDuration * 1000
        }

        //内嵌歌词
        if (metadata.native && !lyricText) {
            const ID3v23 = metadata.native['ID3v2.3']
            for (var i in ID3v23) {
                const { id, value } = ID3v23[i]
                if (id === 'USLT') {
                    lyricText = value.text
                    break
                }
            }
        }

        //TODO
        const hash = MD5(file)
        return {
            id: hash,
            platform: 'local',
            title: title || filename,
            filename,
            artist,
            album,
            duration,
            cover: (IMAGE_PROTOCAL.prefix + file),
            embeddedLyricText: lyricText,
            url: (FILE_PREFIX + file),
            publishTime
        }

    } catch (error) {
        console.log(error)
    }
    return null
}

async function parseImageDataFromFile(file) {
    let coverData = null

    file = transformPath(file)
    const statResult = statSync(file, { throwIfNoEntry: false })
    if (!statResult) return coverData

    try {
        const metadata = await MusicMetadata.parseFile(file, { duration: true })
        const { picture } = metadata.common
        //封面
        const cover = MusicMetadata.selectCover(picture)
        //if (cover) coverData = `data:${cover.format};base64,${cover.data.toString('base64')}`
        if (cover) coverData = { format: cover.format, data: cover.data, text: `data:${cover.format};base64,${cover.data.toString('base64')}` }
    } catch (error) {
        console.log(error)
    }
    return coverData
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

function readText(file, encoding) {
    try {
        file = transformPath(file)
        const statResult = statSync(file, { throwIfNoEntry: false })
        if (statResult) {
            const data = readFileSync(file, { encoding })
            return data.toString()
        }
    } catch (error) {
        console.log(error)
    }
    return null
}

//保存为.pls格式文件
const writePlsFile = async (filename, data) => {
    let content = '[Playlist]\n'
    for (var i = 0; i < data.length; i++) {
        const { title, duration, url } = data[i]
        const num = i + 1
        const file = transformPath(url)
        const length = duration > 0 ? Math.ceil(duration / 1000) : -1
        content += `File${num}=${file}\n`
        content += `Title${num}=${title}\n`
        content += `Length${num}=${length}\n`
    }
    content += `NumberOfEntries=${data.length}\n`
    content += 'Version=2\n'
    return writeText(filename, content)
}

//保存为.m3u格式文件
const writeM3uFile = async (filename, data) => {
    console.log(filename)
    let content = '#EXTM3U\n'
    for (var i = 0; i < data.length; i++) {
        const { title, duration, url } = data[i]
        const file = transformPath(url)
        const length = duration > 0 ? Math.ceil(duration / 1000) : -1
        content += `#EXTINF:${length}, ${title}\n${file}\n`
    }
    return writeText(filename, content)
}

module.exports = {
    randomText,
    randomTextWithinAlphabetNums,
    parseImageDataFromFile,
    FILE_PREFIX,
    IMAGE_PROTOCAL,
    ALPHABET_NUMS,
    nextInt,
    MD5,
    SHA1,
    scanDirTracks,
    readText,
    writePlsFile,
    writeM3uFile
}