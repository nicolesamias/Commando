const { Command } = require('discord.js-commando');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban-member', 'ban-hammer'],
      memberName: 'ban',
      group: 'guild',
      description: 'Banir membros',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToBan',
          prompt: '**Quem você quer banir?**',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: '**Por que você quer banir?**',
          type: 'string'
        }
      ]
    });
  }

  run(message, { reason }) {
    const user = message.mentions.members.first();
    user
      .ban(reason)
      .then(() => message.say(`Banned ${user} reason: ${reason}`))
      .catch(e => {
        message.say('**Ocorreu um erro ao banir esse membro**');
        return console.error(e);
      });
  }
};
