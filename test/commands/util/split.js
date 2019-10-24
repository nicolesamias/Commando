const commando = require('../../../src');

module.exports = class SplitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'split',
			group: 'util',
			memberName: 'split',
			description: 'Envia mensagens divididas com um comprimento total específico.',
			details: 'Este comando é para testar mensagens divididas. O comprimento deve ser pelo menos 1.',
			examples: ['split 3000'],

			args: [
				{
					key: 'length',
					prompt: 'Quantos caracteres você gostaria que a mensagem tivesse?',
					type: 'integer',
					validate: val => parseInt(val) >= 1
				}
			]
		});
	}

	async run(msg, args) {
		let content = '';
		for(let i = 0; i < args.length; i++) content += `${i % 500 === 0 ? '\n' : ''}a`;
		return [await msg.reply(content, { split: true })];
	}
};
