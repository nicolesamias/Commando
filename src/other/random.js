const { Command } = require('discord.js-commando');

module.exports = class RandomNumberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'random',
      aliases: ['random-number', 'number-between'],
      memberName: 'random',
      group: 'other',
      description: 'Gere um número aleatório entre dois números fornecidos',
      args: [
        {
          key: 'min',
          prompt: '**Diga o número mínimo!**',
          type: 'integer'
        },
        {
          key: 'max',
          prompt: '**Diga o número máximo!**',
          type: 'integer'
        }
      ]
    });
  }

  run(message, { min, max }) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return message.say(Math.floor(Math.random() * (max - min + 1)) + min);
  }
};
