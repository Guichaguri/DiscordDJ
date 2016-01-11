var https = require('https');

var version;
var updateAvailable = null;
try {
    version = require('../package.json').version;
} catch(e) {
    version = null;
}

var info = function(handler, obj, userObj, dj, args) {
    var msg = '**DiscordDJ v' + version + '**\n';
    msg += 'Developed by Guilherme Chaguri (Guichaguri)\n';
    msg += '\n';
    if(updateAvailable != null) {
        msg += 'DiscordDJ is outdated!\n';
        msg += 'Download now v' + updateAvailable + ' at:\n';
    }
    msg += 'http://guichaguri.github.io/DiscordDJ/\n';
    handler.sendPrivateMessage(msg);
};

var shutdown = function(handler, obj, userObj, dj, args) {
    //TODO
};

var restart = function(handler, obj, userObj, dj, args) {
    //TODO
};

function checkUpdate() {
    if(version == null) {
        console.log('Could not read version info.');
        return;
    }
    var url = 'https://raw.githubusercontent.com/Guichaguri/DiscordDJ/master/package.json';
    https.get(url, function(res) {
        var result = '';
        res.on('data', function(chunk) {
            result += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(result);
            if(data.version != version) {
                console.log('New update available!');
                console.log('DiscordDJ v' + data.version);
                console.log('http://guichaguri.github.io/DiscordDJ/');
                updateAvailable = data.version;
            }
        });
    }).on('error', function(e) {
        console.log('Could not check for updates: ' + e);
    });
}

function registerCommands(handler) {
    handler.registerCommand('info', ['info', 'information', 'about'], info, '');
    handler.registerCommand('shutdown', ['shutdown'], shutdown, '');
    handler.registerCommand('restart', ['restart', 'reload'], restart, '');
    // TODO PERMISSIONS
}

module.exports = {
    checkUpdate: checkUpdate,
    registerCommands: registerCommands
}