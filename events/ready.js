const { ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in as \x1b[94m${client.user.tag}.\x1b[97m\nID: \x1b[94m${client.user.id}\x1b[97m\nGuilds: \x1b[94m${client.guilds.cache.size}\x1b[97m\nTotal Members: \x1b[94m${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\x1b[97m`);
        client.user.setActivity({ type: ActivityType.Listening, name: "to you!" });
	},
};