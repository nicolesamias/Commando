const { Command } = require('discord.js-commando');

module.exports = class server extends Command {

  constructor(client) {
    super(client, {
      name: 'server',
      aliases: ['server'],
      memberName: 'server',
      group: 'other',
      description: 'Irei mostrar os status de algum servidor de minecraft. **Uso: "server <ip de algum servidor de minecraft>**',
    });
  }


};
