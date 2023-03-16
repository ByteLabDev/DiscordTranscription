// MODULES
require("dotenv").config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { addSpeechEvent } = require("discord-speech-recognition");
const token = process.env.BOTTOKEN;

// CLIENT
const client = new Client({ intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds] });

// REGISTER SPEECH EVENT
addSpeechEvent(client);

// REGISTER TRANSCRIPTIONS
client.transcriptions = new Collection();

// REGISTER EVENTS
client.commands = new Collection();
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// REGISTER COMMANDS
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// LOGIN
client.login(token);