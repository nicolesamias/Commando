const commando = require('../../../src');

module.exports = class ChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'channel',
			aliases: ['chan'],
			group: 'util',
			memberName: 'channel',
			description: 'Obtém informações sobre um canal.',
			examples: ['channel #test', 'channel test'],
			guildOnly: true,

			args: [
				{
					key: 'channel',
					label: 'textchannel',
					prompt: 'Em que canal você gostaria de bisbilhotar?',
					type: 'channel'
				}
			]
		});
	}

	async run(msg, args) {
		const channel = args.channel;
		return msg.reply(`${channel.name} (${channel.id})`);
	}
};
