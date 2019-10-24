const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Exibe uma lista de comandos disponíveis ou informações detalhadas para um comando especificado.',
			details: oneLine`
			O comando pode fazer parte de um nome de comando ou de um nome de comando inteiro.
			Se não for especificado, todos os comandos disponíveis serão listados.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Para qual comando você gostaria de ver a ajuda?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Enviei a lista de comandos em suas Mesagens Diretas!'));
				} catch(err) {
					messages.push(await msg.reply('Não foi possível enviar a você o DM da ajuda. Você provavelmente tem Mensagens Diretas desativadas.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Vários comandos encontrados. Por favor seja mais específico.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Não foi possível identificar o comando. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} para ver a lista de comandos.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
					💕Para usar um comando em  ${msg.guild ? msg.guild.name : 'algum server'},
						use ${Command.usage('algum comando', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						Por exemplo, ${Command.usage('cat', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					💕Para usar algum comando nas mensagens diretas, simplesmente use ${Command.usage('algum comando', null, null)} sem a prefix.

					💕Use ${this.usage('<comando>', null, null)} para ver informações sobre um comando específico.
					💕Use ${this.usage('all', null, null)} para ver a lista de todos os comandos.

					__**${showAll ? 'All commands' : `Comandos disponíveis em: ${msg.guild || 'Mensagens Diretas'}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('**Lista de comandos no privado!**'));
			} catch(err) {
				messages.push(await msg.reply('Não foi possível enviar a lista de comandos para você no privado. Você provavelmente desativou as mensagens diretas.'));
			}
			return messages;
		}
	}
};
