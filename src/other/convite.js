const { Command } = require('discord.js-commando');

module.exports = class convite extends Command {

  constructor(client) {
    super(client, {
      name: 'convite',
      aliases: ['invite'],
      memberName: 'convite',
      group: 'other',
      description: 'Mandarei meu link para você me convidar para o seu servidor! 😚',
    });
  }

};
