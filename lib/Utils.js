
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
    }

};
