const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { newsAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

module.exports = class GlobalNewsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'global-news',
      aliases: ['world-news', 'reuters'],
      group: 'other',
      memberName: 'global-news',
      description: 'Responde às 5 últimas notícias globais',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=reuters&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = json.articles;
      let processArticle = article => {
        const embed = new MessageEmbed()
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
        for (const article of array) {
          const msg = await processArticle(article);
          message.say(msg);
        }
      }
      await processArray(articleArr);
    } catch (e) {
      message.say('**Algo falhou ao longo do caminho**');
      return console.error(e);
    }
  }
};
// The news api is powered by NewsAPI.org!
