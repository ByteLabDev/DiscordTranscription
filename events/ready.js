const { ActivityType } = require("discord.js");
const status = require(`../data/status.js`);

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in as \x1b[94m${client.user.tag}.\x1b[97m\nID: \x1b[94m${client.user.id}\x1b[97m\nGuilds: \x1b[94m${client.guilds.cache.size}\x1b[97m\nTotal Members: \x1b[94m${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\x1b[97m`);


        let firstSt = Math.floor(Math.random()*Object.keys(status.status).length);
        let firstInfo = Object.values(status.status)[firstSt];
        client.user.setActivity({ type: firstInfo.type, name: firstInfo.text });

        setInterval(() => {
            // CHANGE THE STATUS EVERY 30 MINUTES
            let rSt = Math.floor(Math.random()*Object.keys(status.status).length);
            let sInfo = Object.values(status.status)[rSt];

            client.user.setActivity({ type: sInfo.type, name: sInfo.text });

        }, 1000 * 60 * 30);
	},
};