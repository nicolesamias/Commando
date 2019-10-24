const { Command } = require('discord.js-commando');

module.exports = class PruneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      aliases: ['delete-messages', 'bulk-delete'],
      description: 'Deletar mensagens recentes. **(Máximo 99)**',
      group: 'guild',
      memberName: 'clear',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
      args: [
        {
          key: 'deleteCount',
          prompt: '**Quantas mensagens serão apagadas?**',
          type: 'integer',
          validate: deleteCount => deleteCount < 100 && deleteCount > 0
        }
      ]
    });
  }

  run(message, { deleteCount }) {
    message.channel
      .bulkDelete(deleteCount)
      .then(messages => message.say(`👌`))
      .catch(e => {
        console.error(e);
        return message.say(
          '**Ocorreu um erro ao tentar excluir as mensagens :(**'
        );
      });
  }
};
