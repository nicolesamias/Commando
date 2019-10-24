const commando = require('../../../src');

module.exports = class CreateChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'create-channel',
			aliases: ['create-chan', 'add-channel', 'add-chan'],
			group: 'util',
			memberName: 'create-channel',
			description: 'Cria um canal.',
			examples: ['create-channel Test channel'],
			guildOnly: true,
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_CHANNELS'],

			args: [
				{
					key: 'name',
					label: 'channel name',
					prompt: 'Como você gostaria que o canal fosse chamado?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { name }) {
		const channel = await msg.guild.channels.create(name);
		return msg.reply(`Criando ${channel} (${channel.id})`);
	}
};
