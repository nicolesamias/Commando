const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'commands',
			memberName: 'reload',
			description: 'Recarrega um comando ou grupo de comandos.',
			details: oneLine`
			O argumento deve ser o nome / ID (parcial ou inteiro) de um comando ou grupo de comandos.
			Fornecer um grupo de comandos recarregará todos os comandos nesse grupo.
			Somente o proprietário do bot pode usar este comando.
			`,
			examples: ['reload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Qual comando ou grupo você gostaria de recarregar?',
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Erro ao transmitir comando recarregar para outros fragmentos`);
				this.client.emit('error', err);
				if(isCmd) {
					await msg.reply(`Recarregado o comando\`${cmdOrGrp.name}\`, mas falhou ao recarregar em outros fragmentos.`);
				} else {
					await msg.reply(
						`Recarregado todos os comandos do grupo \`${cmdOrGrp.name}\` , mas falhou ao recarregar em outros fragmentos.`
					);
				}
				return null;
			}
		}

		if(isCmd) {
			await msg.reply(`Recarregado o comando \`${cmdOrGrp.name}\` ${this.client.shard ? ' em todos os fragmentos' : ''}.`);
		} else {
			await msg.reply(
				`Recarregado todos os comandos do grupo \`${cmdOrGrp.name}\` ${this.client.shard ? ' em todos os fragmentos' : ''}.`
			);
		}
		return null;
	}
};
