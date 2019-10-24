const { Command } = require('discord.js-commando');

module.exports = class toloveru extends Command {

  constructor(client) {
    super(client, {
      name: '---',
      aliases: ['toloveru'],
      memberName: 'toloveru',
      group: 'other',
      description: 'Secreto',
    });
  }


};
