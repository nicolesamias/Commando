const fs = require('fs');
const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'commands',
			memberName: 'load',
			description: 'Carrega um novo comando.',
			details: oneLine`
			O argumento deve ser o nome completo do comando no formato de \`group:memberName\`.
			Somente a dona do bot pode usar este comando.
			`,
			examples: ['load some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to load?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('That command is already registered.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		const command = this.client.registry.commands.last();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command load to other shards`);
				this.client.emit('error', err);
				await msg.reply(`Loaded \`${command.name}\` command, but failed to load on other shards.`);
				return null;
			}
		}

		await msg.reply(`Loaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
