
const url = require('url');
const http = require('http');
const https = require('https');
const child_process = require('child_process');

module.exports = {

    request(theUrl, method, data, headers) {
        return new Promise(function(resolve, reject) {

            var cb = function(res) {
                res.once('error', reject);
                let result = '';
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

    findCommand(cmds) {
        if(process.platform == 'win32') {
            // Adds .exe extension for each command
            let winCmds = cmds.map((cmd) => cmd + '.exe');
            cmds = winCmds.concat(cmds);
        }

        for(var i = 0; i < cmds.length; i++) {
            // Tries every command trying to find one that works
            var p = child_process.spawnSync(cmds[i]);
            if(!p.error) return cmds[i];
        }
        return null;
    },

    createProcess(stream, cmd, args) {
        const process = child_process.spawn(cmd, args);

        stream.pipe(process.stdin);
        return process.stdout;
    }

};
