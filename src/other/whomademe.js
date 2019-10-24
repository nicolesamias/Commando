const { Command } = require('discord.js-commando');

module.exports = class WhoMadeMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'whomademe',
      aliases: ['bot-maker', 'bot-creator'],
      memberName: 'whomademe',
      group: 'other',
      description: "Mostra a criadora do bot"
    });
  }

  run(message) {
    message.say(
      '💕 **Feita por @nii#2296** 💕'
    );
  }
};
