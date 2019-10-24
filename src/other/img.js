const { Command } = require('discord.js-commando');

module.exports = class img extends Command {

  constructor(client) {
    super(client, {
      name: 'img',
      aliases: ['image'],
      memberName: 'img',
      group: 'other',
      description: 'Faz eu mandar alguma imagem específica. **Uso: "img <alguma coisa>"**',
    });
  }


};
