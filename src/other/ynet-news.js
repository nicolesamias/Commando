const { MessageEmbed } = require('discord.js');
const { newsAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');

module.exports = class YnetNewsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ynet-news',
      aliases: ['israel-news', 'ynet'],
      group: 'other',
      memberName: 'ynet-news',
      description: 'Respostas com as 5 últimas notícias de Israel',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=ynet&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      let articleArr = json.articles;
      let processArticle = article => {
        let embed = new MessageEmbed()
          .setColor('#fa48e5')
          .setTitle(article.title)
          .setURL(article.url)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter('---------------------------------');
        return embed;
      };
      async function processArray(array) {
        for (let article of array) {
          let msg = await processArticle(article);
          message.say(msg);
        }
      }
      await processArray(articleArr);
    } catch (err) {
      message.say('**Algo falhou ao longo do caminho**');
      return console.error(err);
    }
  }
};

