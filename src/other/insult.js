const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class InsultCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'insult',
      group: 'other',
      memberName: 'insult',
      description: 'Gera um insulto do mal!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    // thanks to https://evilinsult.com :)
    fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#fa48e5')
          .setTitle('Insulto do Mal!')
          .setDescription(json.insult)
          .setURL('https://evilinsult.com');
        return message.say(embed);
      })
      .catch(e => {
        message.say('Falha ao insultar 😭');
        return console.error(e);
      });
  }
};
