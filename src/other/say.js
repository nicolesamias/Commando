const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      aliases: ['make-me-say', 'print'],
      memberName: 'say',
      group: 'other',
      description: 'Faz eu dizer algo',
      guildOnly: true,
      userPermissions: ['MENTION_EVERYONE'],
      args: [
        {
          key: 'text',
          prompt: '**O que você quer que eu diga?**',
          type: 'string'
        }
      ]
    });
  }

}
