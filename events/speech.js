const { EmbedBuilder } = require("discord.js");

module.exports = {
        name: 'speech',
        once: false,
	execute(message) {
                if (!message.content) return;
                
                const channel = message.client.transcriptions.get(message.guild.id).textChannel;

                const embed = new EmbedBuilder()
                .setTitle(message.author.username)
                .setDescription(message.content)
                .setColor(`#2B2D31`);

                channel.send({ embeds: [embed] });
	},
};
