const { Command } = require('discord.js-commando');

module.exports = class CreateVoiceChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-voice-channel',
      aliases: ['create-voice', 'voice-channel'],
      memberName: 'create-voice-channel',
      group: 'guild',
      description: 'Creates a new voice channel',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'channelName',
          prompt:
            'Qual será o nome desse novo canal de voz?',
          type: 'string',
          validate: channelName => channelName.length < 50
        }
      ]
    });
  }

  run(message, { channelName }) {
    message.guild.channels
      .create(channelName, {
        type: 'voice'
      })
      .then(
        message.say(
          `Criado o canal de voz: ${channelName.toLowerCase()}`
        )
      )
      .catch(e => {
        console.error(e);
        return message.say(
          '**Ocorreu um erro ao criar esse canal**'
        );
      });
  }
};
