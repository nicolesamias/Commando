const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');

module.exports = class RedditCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reddit',
      aliases: ['subreddit', 'reddit-search'],
      group: 'other',
      memberName: 'reddit',
      description:
        'Respostas com as 5 principais postagens diárias no subreddit desejado, você pode especificar a classificação e o tempo',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'subreddit',
          prompt: 'Qual subreddit você gostaria de pesquisar?',
          type: 'string',
          default: 'all',
          max: 50,
          wait: 20
        },
        {
          key: 'sort',
          prompt:
            'Quais postagens você deseja ver? Escolha entre: melhor / hot / top / novo / crescente / controverso',
          type: 'string',
          default: 'top',
          validate: sort =>
            sort === 'melhor' ||
            sort === 'hot' ||
            sort === 'novo' ||
            sort === 'top' ||
            sort === 'controverso' ||
            sort === 'crescente',
          wait: 10
        }
      ]
    });
  }

  // If you want to restrict nsfw posts, remove the commented out code below

  async run(message, { subreddit, sort }) {
    if (sort === 'top' || sort === 'controverso') {
      await message.say(
        `Deseja receber as postagens de ${sort} da última **hora** / **semana** / **mês** / **ano** ou **todas**?`
      );
      try {
        var t = await message.channel.awaitMessages(
          m =>
            m.content === 'hora' ||
            m.content === 'semana' ||
            m.content === 'mês' ||
            m.content === 'ano' ||
            m.content === 'todas',
          {
            max: 1,
            maxProcessed: 1,
            time: 60000,
            errors: ['time']
          }
        );
        var timeFilter = t.first().content;
      } catch (e) {
        console.error(e);
        return message.say('**Tente novamente e insira um tempo válido**');
      }
    }
    fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=5&t=${
        timeFilter ? timeFilter : 'dia'
      }`
    )
      .then(res => res.json())
      .then(json => {
        const dataArr = json.data.children;
        for (let i = 0; i < dataArr.length; i++) {
          // if (dataArr[i].data.over_18 === true) {
          //   message.say(':no_entry: nsfw :no_entry:');
          // } else {
          message.say(embedPost(dataArr[i].data));
          //}
        }
      })
      .catch(e => {
        message.say('**O subreddit solicitado não foi encontrado**');
        return console.error(e);
      });
    // returns an embed that is ready to be sent
    function embedPost(data) {
      if (data.title.length > 255) {
        data.title = data.title.substring(0, 252) + '...'; // discord.js does not allow embed title lengths greater than 256
      }
      return new MessageEmbed()
        .setColor(data.over_18 ? '#cf000f' : '#fa48e5') // if post is nsfw, color is red
        .setTitle(data.title)
        .setThumbnail(
          data.thumbnail === 'self'
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Reddit.svg/256px-Reddit.svg.png'
            : data.thumbnail
        )
        .setURL(`https://www.reddit.com${data.permalink}`)
        .setDescription(`Upvotes: ${data.score} :thumbsup: `)
        .setAuthor(data.author);
    }
  }
};
