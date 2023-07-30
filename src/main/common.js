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

module.exports = {
    randomText,
    randomTextWithinAlphabetNums,
    nextInt,
    MD5, SHA1,
}