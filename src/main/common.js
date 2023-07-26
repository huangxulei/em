// const path = require('path');
// const CryptoJS = require('crypto-js');
// const MusicMetadata = require('music-metadata');
// const { AUDIO_EXTS } = require('./env');

// const FILE_PREFIX = 'file:///'
// const IMAGE_PROTOCAL = {
//     scheme: 'lessimage',
//     prefix: 'lessimage://',
// }

const nextInt = (max) => {
    const limit = max < 1024 ? 1024 : max
    return parseInt(Math.random() * limit) % max
}

module.exports = {
    nextInt
}