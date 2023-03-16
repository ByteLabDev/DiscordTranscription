const dv = require(`@discordjs/voice`)

module.exports = {
        name: 'speech',
        once: false,
	execute(message) {
                if (!message.content) return;
                let shiftCount = 0;

                const client = message.client;

                if(message.content.toLowerCase() === `useless.`){
                        client.voiceCommands.get(`stop`).execute(message);
                        return;
                }

                if(message.content.toLowerCase().startsWith(`hey useless`) || message.content.toLowerCase().startsWith(`a useless`) || message.content.toLowerCase().startsWith(`you said`)) shiftCount = 2;
                else if(message.content.toLowerCase().startsWith(`useless`) || message.content.toLowerCase().startsWith(`uses`)) shiftCount = 1;
                else return;

                const commandPrefix = message.content.toLowerCase().split(" ")[shiftCount];
                const command = client.voiceCommands.get(commandPrefix);

                if(!command) return;

                const connection = dv.getVoiceConnection(message.guild.id);

                if(!connection) return;

                const player = dv.createAudioPlayer({
                        behaviors: {
                                noSubscriber: dv.NoSubscriberBehavior.Pause,
                        },
                });
                
                let responseNotifier;
                if(command.data.name === `pause` || command.data.name === `unpause`) responseNotifier = dv.createAudioResource(`./data/sounds/CommandSuccessAlternative.mp3`);
                else responseNotifier = dv.createAudioResource(`./data/sounds/CommandSuccess.mp3`);

                if(command.data.name === `skip`){
                        command.execute(message, shiftCount);
                        return;
                }

                player.play(responseNotifier);
                const sub = connection.subscribe(player);

                player.on(dv.AudioPlayerStatus.Idle, ()=>{
                        sub.unsubscribe();
                        player.stop();

                        const plr = client.players.get(message.guild.id);
                        
                        if(plr){
                                if(commandPrefix != `pause` && commandPrefix != `paws`) message.connection.subscribe(plr);
                        }

                        command.execute(message, shiftCount);
                })
                
	},
};

// TODO: Get key for speech from: https://www.chromium.org/developers/how-tos/api-keys/