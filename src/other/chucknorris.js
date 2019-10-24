const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ChuckNorrisCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'chucknorris',
      aliases: ['chuckfact', 'norris', 'chuck-norris'],
      group: 'other',
      memberName: 'chucknorris',
      description: 'Obtenha um fato sobre Chuck Norris!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    // thanks to https://api.chucknorris.io
    fetch('https://api.chucknorris.io/jokes/random')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#fa48e5')
          .setTitle('Fato sobre Chuck Norris')
          .setDescription(json.value)
          .setURL('https://api.chucknorris.io');
        return message.say(embed);
      })
      .catch(e => {
        message.say('**Ocorreu um erro, Chuck está investigando isso!**');
        return console.error(e);
      });
  }
};
