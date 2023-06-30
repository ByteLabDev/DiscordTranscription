const { InteractionType } = require(`discord.js`);

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand){

            if(!interaction.guild){
                interaction.reply({ content: `You cannot use commands in DMs.`, ephemeral: true });
                return;
            }

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
        
            try {
                await command.execute(interaction, interaction.client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: `There was a problem with the command.`, embeds: [], ephemeral: true }).catch(()=>{
                    interaction.editReply({ content: 'There was a problem with the command.', embeds: [], ephemeral: true }).catch(()=>{return});
                });
            }
        }
	},
};