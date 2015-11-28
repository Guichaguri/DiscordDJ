# DiscordDJ
Discord DJ Bot. Let you play music in your server. Inspired by PlugDJ

## Installing
To install DiscordDJ, you just need [Node.js and NPM](http://nodejs.org) and run the command below:

```npm install discord-dj```

## Configuring
After you have installed DiscordDJ, open `bots.json` (it should be in `node_modules/discord-dj`)

* **email:** The email for the discord account of the bot
* **password:** The password for the discord account of the bot
* **voice:** The voice channel name or ID that the bot should join
* **log:** The text channel where the bot will send "now playing" messages. Setting this to null will disable log messages
* **text:** The text channel where the bot will watch for commands. Setting this to null will make it work for all text channels

You can add more entries to run more bots in the same server

## Running
To run DiscordDJ, you need to execute `npm start` or `node DiscordDJ.js` inside `node_modules/discord-dj`

## Developing
If you are a developer and want DiscordDJ as a library, you can:

```js
var DiscordDJ = require('discord-dj');

// Initialize the bot
var dj = new DiscordDJ.DJ(bot); // bot is a discord.js Client object

// Add a song to queue (user is a discord.js User object)
dj.addToQueue(new DiscordDJ.FileAudio(user, "path/to/audio.mp3"));
dj.addToQueue(new DiscordDJ.YoutubeVideo(user, "https://www.youtube.com/watch?v=CwW6l29vvjI"));
dj.addToQueue(new DiscordDJ.IcyAudio(user, "http://listen.radionomy.com/DeepHouse")); // Shoutcast or Icecast stream. It will only stop playing if the radio server is shutdown

// Skip/stop current song
dj.skip();

// Force another song to play
dj.play(new DiscordDJ.FileAudio(user, "path/to/intro.mp3"));
```

Note: If you are using DiscordDJ as a library, you don't need to configure `bots.json`