const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Informa quando um comando é desconhecido.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
    }
}
