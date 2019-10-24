const { Command } = require('discord.js-commando');

module.exports = class pervert extends Command {

  constructor(client) {
    super(client, {
      name: 'pervert',
      aliases: ['pervert'],
      memberName: 'pervert',
      group: 'other',
      description: 'Mandarei uma imagem aleatória, sobre algum pervertido',
    });
  }


};
