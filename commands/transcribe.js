const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require(`@discordjs/voice`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transcribe')
		.setDescription('Transcribes your voice in real time.'),
	async execute(interaction) {

        // Get the voice channel the user is in
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: 'You need to be in a voice channel to use this command.', ephemeral: true });


        // Get the permissions for the bot in the voice channel

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply({ content: 'I need the permissions to join and speak in your voice channel!', ephemeral: true });
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true, // This is intentionally here, since this code is meant to be an example for a bug I found.
        });

        interaction.client.transcriptions.set(interaction.guild.id, { textChannel: interaction.channel, interaction: interaction })

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Transcribing...')
            .setDescription('Your voice will be transcribed in this channel now.')
            .setColor(0x22FF55)
            .setFooter({text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
            .setTimestamp();

        await interaction.reply({embeds: [embed]});
	},
};