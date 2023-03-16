const perms = require(`../data/botdata.js`);
const Welcome = require(`../mongodb/schemas/welcome`);
const Settings = require(`../mongodb/schemas/settings`);
const validator = require(`../settingsValidator.js`);
const { InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);
const { joinVoiceChannel } = require("@discordjs/voice");

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

            if(perms.data.permissions.member[interaction.commandName]){
                for(perm of perms.data.permissions.member[interaction.commandName].permissions){
                    if(!interaction.member.permissions.has(perm)){
                        await interaction.reply({ content: `You need the following permissions to use this command: \`\`${perms.data.permissions.member[interaction.commandName].permName}\`\``, ephemeral: true });
                        return;
                    }
                }
            }
            
            if(perms.data.permissions.bot[interaction.commandName]){
                for(perm of perms.data.permissions.bot[interaction.commandName].permissions){
                    if(!interaction.guild.members.me.permissions.has(perm)){
                        await interaction.reply({ content: `Some of the permissions I need are missing. For the ${interaction.commandName} command, I need the following permissions: \`\`${perms.data.permissions.bot[interaction.commandName].permName}\`\``, ephemeral: true });
                        return;
                    }
                }
            }
        
            try {
                await command.execute(interaction, interaction.client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: `There was a problem with the command.`, embeds: [], ephemeral: true }).catch(()=>{
                    interaction.editReply({ content: 'There was a problem with the command.', embeds: [], ephemeral: true }).catch(()=>{return});
                });
            }
        }else if(interaction.type === InteractionType.ModalSubmit){
            if (interaction.customId === 'welcome') {
                const wMessage = interaction.fields.getTextInputValue('welcomeMessage').toString().replace(`[user]`, interaction.user.username);

                let welcomeData = await interaction.client.createWelcome(interaction);
                

                try{
                    await Welcome.findOneAndUpdate({ guildId: interaction.guild.id }, { channelId: interaction.channel.id, welcomeMessage: wMessage, isImage: false, enabled: true });
                    await interaction.reply({ content: `__**Your welcome message should now look like this:**__\n${wMessage}`});
                }catch(error){
                    await interaction.reply(`There was a problem using the command. Please try again later.`);
                    console.log(error);
                }
            }else if(interaction.customId === `welcomeImage`){
                const wTitle = (interaction.fields.getTextInputValue('serverTitle'));
                await interaction.reply(`Set server title as ${wTitle} in Welcome Card.`)
                await Welcome.findOneAndUpdate({ guildId: interaction.guild.id }, { channelId: interaction.channel.id, serverTitle: wTitle, isImage: true, enabled: true });
            }else if(interaction.customId === `settingsPopup`){
                const code = interaction.fields.getTextInputValue('settingsCode');
                validator.codeToJson(code).then(res=>{

                    const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('settingsconfirm')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Success),
                    );


                    const embed = new EmbedBuilder()
                    .setTitle(`Settings`)
                    .setDescription(`\`\`\`json\n${JSON.stringify(res, null, 2)}\`\`\``)
                    .setColor(`Blurple`)
                    .setFooter({ text: `Settings Code: ${code.toString()}` });
                    interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
                }).catch(err=>{
                    console.log(err)
                    interaction.reply({ content: `The code is invalid. You can get the code from [uselessbot.xyz](https://www.uselessbot.xyz/settings)`, ephemeral: true });
                })
            }
        }else if(interaction.isButton()){
            // Check button id
            if(interaction.customId === 'rock' || interaction.customId === 'paper' || interaction.customId === 'scissors'){
            let sessionID = interaction.message.embeds[0].footer.text.slice(-19);
                if(sessionID){
                    const rps = interaction.client.rps.get(sessionID);
                    if(!rps){
                        interaction.reply({ content: `This game has expired.`, ephemeral: true });
                        return;
                    }

                    if(interaction.user.id === rps.opponents.opOne.id){
                        if(rps.opponents.opOne.choice){
                            interaction.reply({ content: `You have already chosen your move (${rps.opponents.opOne.choice}).`, ephemeral: true });
                            return;
                        }else{
                            interaction.reply({ content: ` You have chosen ${interaction.customId}.`, ephemeral: true });
                        }

                        interaction.client.rps.set(sessionID, { interactionData: rps.interactionData, opponents: { opOne: { id: rps.opponents.opOne.id, choice: interaction.customId }, opTwo: rps.opponents.opTwo } });

                        const fields = interaction.message.embeds[0].fields;
                        let embed = new EmbedBuilder()
                            .setTitle(`Rock Paper Scissors`)
                            .setColor(`Blurple`)
                            .addFields(
                                { name: `${fields[0].name}`, value: `Ready`, inline: true },
                                { name: `**     **VS**     **`, value: `** **`, inline: true },
                                { name: `${fields[2].name}`, value: fields[2].value, inline: true },
                                { name: `** **`, value: `** **`, inline: false },
                            )
                            .setFooter(interaction.message.embeds[0].footer);

                            plrOne = interaction.customId;
                            plrTwo = rps.opponents.opTwo.choice;

                        if(plrTwo){
                            embed.addFields({ name: `Round ended`, value: `<t:${Math.round(Date.now() / 1000)}:R>`, inline: true });
                            
                            if((plrOne === plrTwo)){
                                embed.addFields({ name: `Winner`, value: `Tie`, inline: true });
                                interaction.client.rps.delete(sessionID);
                            }else if((plrOne === `rock` && plrTwo === `paper`) || (plrOne === `paper` && plrTwo === `scissors`) || (plrOne === `scissors` && plrTwo === `rock`)){
                                interaction.client.users.fetch(`${rps.opponents.opTwo.id}`).then((user)=>{
                                    console.log(rps.opponents.opTwo);
                                    embed.addFields({ name: `Winner`, value: user.username, inline: true });
                                    interaction.client.rps.delete(sessionID);
                                });
                            }else{
                                interaction.client.users.fetch(`${rps.opponents.opOne.id}`).then((user)=>{
                                embed.addFields({ name: `Winner`, value: user.username, inline: true });
                                interaction.client.rps.delete(sessionID);
                                });
                            }
                        }else{
                            embed.addFields({ name: `Round ends`, value: fields[4].value, inline: true });
                            embed.addFields({ name: `Winner`, value: `N/A`, inline: true });
                        }
                            
                        rps.interactionData.editReply({ embeds: [embed] });

                    }else if(interaction.user.id === rps.opponents.opTwo.id){
                        if(rps.opponents.opTwo.choice){
                            interaction.reply({ content: `You have already chosen your move (${rps.opponents.opTwo.choice}).`, ephemeral: true });
                            return;
                        }else{
                            interaction.reply({ content: ` You have chosen ${interaction.customId}.`, ephemeral: true });
                        }                

                        interaction.client.rps.set(sessionID, { interactionData: rps.interactionData, opponents: { opOne: rps.opponents.opOne, opTwo: { id: rps.opponents.opTwo.id, choice: interaction.customId } } });

                        const fields = interaction.message.embeds[0].fields;
                        let embed = new EmbedBuilder()
                            .setTitle(`Rock Paper Scissors`)
                            .setColor(`Blurple`)
                            .addFields(
                                { name: `${fields[0].name}`, value: fields[0].value, inline: true },
                                { name: `**     **VS**     **`, value: `** **`, inline: true },
                                { name: `${fields[2].name}`, value: `Ready`, inline: true },
                                { name: `** **`, value: `** **`, inline: false },
                            )
                            .setFooter(interaction.message.embeds[0].footer);

                            plrOne = rps.opponents.opOne.choice;
                            plrTwo = interaction.customId;

                        if(plrOne){
                            embed.addFields({ name: `Round ended`, value: `<t:${Math.round(Date.now() / 1000)}:R>`, inline: true });
                            
                            if((plrOne === plrTwo)){
                                embed.addFields({ name: `Winner`, value: `Tie`, inline: true });
                                interaction.client.rps.delete(sessionID);
                            }else if((plrOne === `rock` && plrTwo === `paper`) || (plrOne === `paper` && plrTwo === `scissors`) || (plrOne === `scissors` && plrTwo === `rock`)){
                                interaction.client.users.fetch(`${rps.opponents.opTwo.id}`).then((user)=>{
                                    embed.addFields({ name: `Winner`, value: user.username, inline: true });
                                    interaction.client.rps.delete(sessionID);
                                });
                            }else{
                                interaction.client.users.fetch(`${rps.opponents.opOne.id}`).then((user)=>{
                                embed.addFields({ name: `Winner`, value: user.username, inline: true });
                                interaction.client.rps.delete(sessionID);
                                });
                            }
                        }else{
                            embed.addFields({ name: `Round ends`, value: fields[4].value, inline: true });
                            embed.addFields({ name: `Winner`, value: `N/A`, inline: true });
                        }
                            
                        rps.interactionData.editReply({ embeds: [embed] });
                    }else{
                        interaction.reply({ content: `You are not in this game.`, ephemeral: true });
                    }
                }
            }else if(interaction.customId === `settingsconfirm`){
                interaction.deferUpdate();
                // Edit embed
                //const settingsData = await interaction.client.createSettings(interaction.member);
                let newJSON = interaction.message.embeds[0].description.toString();
                newJSON = newJSON.replaceAll("```", ``);
                newJSON = newJSON.replaceAll("json", ``);
                newJSON = newJSON.replaceAll("\n", ``);
                

                const updated = JSON.parse(newJSON)

                
                await Settings.findOneAndUpdate({ memberId: interaction.member.id }, { 
                    receiveRings: updated.ringMessages,
                    receiveUpdates: updated.receiveUpdates,
                    allowAvatarGrab: updated.avatarGrab,
                    disableVoice: updated.disableVoice,
                    defaultMusicService: updated.defaultMusicService,
                 });

                const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.tag}'s Settings Have Been Updated Successfully`)
                .setColor(`#36393F`)

                interaction.channel.send({ embeds: [embed] }).catch(e=>{return;});;
            }else if(interaction.customId === `voiceconfirm`){
                interaction.deferUpdate();
                const client = interaction.client;
                await Settings.findOneAndUpdate({ memberId: interaction.member.id }, { voiceCommandWarn: false });
                const voiceChannel = interaction.member?.voice.channel;
                if (voiceChannel) {

                    const pT = client.playTypes.get(voiceChannel.guild.id);
                    if(pT === `talk`){
                        await interaction.channel.send({content: `You cannot use voice commands while using the **/talk** command. Use **/disconnect** to reset.`, ephemeral: true}).catch(e=>{return;});
                        return;
                    }else if(pT === `play`){
                        await interaction.channel.send({content: `You must stop any music players before using voice commands. Use **/disconnect** to reset.`, ephemeral: true}).catch(e=>{return;});
                        return;
                    }

                    await joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                        selfDeaf: false,
                    });
            
                    client.playTypes.set(voiceChannel.guild.id, `voicecmd`);
                    client.voiceCommandChannel.set(voiceChannel.guild.id, interaction.channel);

                    await interaction.channel.send(`Joining voice channel. Use **/help voice** for information about voice commands.`).catch(e=>{return;});
                }else{
                    await interaction.channel.send({ content: `You must be in a voice channel that I can join.`, ephemeral: true }).catch(e=>{return;});
                }

        
            }
        }
	},
};