# DiscordTranscription 

A simple bot that transcribes conversations using [discord-speech-recognition](https://www.npmjs.com/package/discord-speech-recognition)

## Setup

Make a new `.env` file. This will contain all of your necessary bot information. Make sure you have your .env file set up like this:

```dotenv
BOTTOKEN=Your.bot.token
CLIENTID=1234567890123456789
```

Then, run the `deploy-commands.js` file. This will register the commands.
```
node deploy-commands.js
```

## Running the bot
To run the bot, run the following command:
```
node index.js
```
