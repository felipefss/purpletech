'use strict';

const http = require('http');
const fs = require('fs');

// Saves all the transactions' info for persistency
exports.saveInfoToFile = (infoObj) => {
    let file = fs.createWriteStream('convInfo.txt');
    file.write(JSON.stringify(infoObj));
    file.end();

    file.on('finish', () => {
        console.log('Info file sucessfuly written.');
    });
};

// Loads the transactions' info
exports.loadInfoFromFile = (callback) => {
    fs.readFile('convInfo.txt', 'utf-8', (err, data) => {
        if (err) {
            if (err.code !== 'ENOENT')
                throw err;
            callback(err.code, null);
            return;
        }

        callback(null, JSON.parse(data));
    });
};