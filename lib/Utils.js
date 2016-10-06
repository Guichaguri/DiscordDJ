
const url = require('url');
const http = require('http');
const https = require('https');

module.exports = {

    request(theUrl, method, data, headers) {
        return new Promise(function(resolve, reject) {

            var cb = function(res) {
                res.once('error', reject);
                var result = '';
                res.on('data', function(chunk) {
                    result += chunk;
                });
                res.once('end', function() {
                    resolve(result);
                });
            };
            theUrl = url.parse(theUrl);
            if(method) theUrl['method'] = method;
            if(headers) theUrl['headers'] = headers;

            var req;
            if(theUrl.protocol == 'http:') {
                req = http.request(theUrl, cb);
            } else {
                req = https.request(theUrl, cb);
            }
            req.once('error', reject);
            if(data) req.write(data);
            req.end();

        });
    },

    hrtime() {
        // Thanks to discordie for this function
        const t = process.hrtime();
        return t[0] * 1000 + t[1] / 1000000;
    },

    isStream(stream) {
        return stream != null && typeof stream === 'object' && typeof stream.pipe === 'function';
    },

    copyProperties(target, source) {
        // This function was written by Mozilla Hacks
        // https://hacks.mozilla.org/2015/08/es6-in-depth-subclassing/
        for(let key of Reflect.ownKeys(source)) {
            if(key !== "constructor" && key !== "prototype" && key !== "name") {
                let desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            }
        }
    }

};
