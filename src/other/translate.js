const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { yandexAPI } = require('../../config.json');
const fetch = require('node-fetch');

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      aliases: ['convert-to-english', 'translation'],
      memberName: 'translate',
      group: 'other',
      description:
        'Traduzir para inglês (por enquanto) de qualquer idioma suportado usando o serviço de tradução yandex',
      throttling: {
        usages: 2,
        duration: 12
      },
      args: [
        {
          key: 'text',
          prompt: 'Que texto você quer traduzido?',
          type: 'string',
          validate: text => text.length < 3000
        }
      ]
    });
  }

  run(message, { text }) {
    fetch(
      // Powered by Yandex.Translate http://translate.yandex.com/
      `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexAPI}&text=${encodeURI(
        text
      )}&lang=${'en'}`
    )
      .then(res => res.json())
      .then(json => {
        return message.say(embedTranslation(json.text[0]));
      })
      .catch(e => {
        console.error(e);
        return message.say(
          '**Ocorreu um erro ao tentar traduzir o texto**'
        );
      });

    function embedTranslation(text) {
      return new MessageEmbed()
        .setColor('#fa48e5')
        .setTitle('Tradutor')
        .setURL('http://translate.yandex.com/')
        .setDescription(text)
        .setFooter('Powered by Yandex.Translate');
    }
  }
};
