const { Command } = require('discord.js-commando');

module.exports = class CreateTextChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-text-channel',
      aliases: ['create-channel-text', 'text-channel'],
      memberName: 'create-text-channel',
      group: 'guild',
      description: '**Criar um canal de texto**',
      userPermissions: ['MANAGE_CHANNELS'],
      guildOnly: true,
      args: [
        {
          key: 'channelName',
          prompt: 'Qual será o nome desse novo canal de texto?',
          type: 'string',
          validate: channelName => channelName.length < 50
        }
      ]
    });
  }

  run(message, { channelName }) {
    message.guild.channels
      .create(channelName, { type: 'text' })
      .then(message.say(`Criado o canal de texto: ${channelName}`))
      .catch(e => {
        console.error(e);
        return message.say(
          '**Ocorreu um erro ao criar esse canal**'
        );
      });
  }
};
