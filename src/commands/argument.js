const { escapeMarkdown } = require('discord.js');
const { oneLine, stripIndents } = require('common-tags');
const ArgumentUnionType = require('../types/union');

/** A fancy argument */
class Argument {
	/**
	 * @typedef {Object} ArgumentInfo
	 * @property {string} key - Key for the argument
	 * @property {string} [label=key] - Label for the argument
	 * @property {string} prompt - First prompt for the argument when it wasn't specified
	 * @property {string} [error] - Predefined error message to output for the argument when it isn't valid
	 * @property {string} [type] - Type of the argument (must be the ID of one of the registered argument types
	 * or multiple IDs in order of priority separated by `|` for a union type - see
	 * {@link CommandoRegistry#registerDefaultTypes} for the built-in types)
	 * @property {number} [max] - If type is `integer` or `float`, this is the maximum value of the number.
	 * If type is `string`, this is the maximum length of the string.
	 * @property {number} [min] - If type is `integer` or `float`, this is the minimum value of the number.
	 * If type is `string`, this is the minimum length of the string.
	 * @property {ArgumentDefault} [default] - Default value for the argument (makes the arg optional - cannot be `null`)
	 * @property {string[]} [oneOf] - An array of values that are allowed to be used
	 * @property {boolean} [infinite=false] - Whether the argument accepts infinite values
	 * @property {Function} [validate] - Validator function for the argument (see {@link ArgumentType#validate})
	 * @property {Function} [parse] - Parser function for the argument (see {@link ArgumentType#parse})
	 * @property {Function} [isEmpty] - Empty checker for the argument (see {@link ArgumentType#isEmpty})
	 * @property {number} [wait=30] - How long to wait for input (in seconds)
	 */

	/**
	 * Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument.
	 * @typedef {*|Function} ArgumentDefault
	 */

	/**
	 * @param {CommandoClient} client - Client the argument is for
	 * @param {ArgumentInfo} info - Information for the command argument
	 */
	constructor(client, info) {
		this.constructor.validateInfo(client, info);

		/**
		 * Key for the argument
		 * @type {string}
		 */
		this.key = info.key;

		/**
		 * Label for the argument
		 * @type {string}
		 */
		this.label = info.label || info.key;

		/**
		 * Question prompt for the argument
		 * @type {string}
		 */
		this.prompt = info.prompt;

		/**
		 * Error message for when a value is invalid
		 * @type {?string}
		 */
		this.error = info.error || null;

		/**
		 * Type of the argument
		 * @type {?ArgumentType}
		 */
		this.type = this.constructor.determineType(client, info.type);

		/**
		 * If type is `integer` or `float`, this is the maximum value of the number.
		 * If type is `string`, this is the maximum length of the string.
		 * @type {?number}
		 */
		this.max = typeof info.max !== 'undefined' ? info.max : null;

		/**
		 * If type is `integer` or `float`, this is the minimum value of the number.
		 * If type is `string`, this is the minimum length of the string.
		 * @type {?number}
		 */
		this.min = typeof info.min !== 'undefined' ? info.min : null;

		/**
		 * The default value for the argument
		 * @type {?ArgumentDefault}
		 */
		this.default = typeof info.default !== 'undefined' ? info.default : null;

		/**
		 * Values the user can choose from
		 * If type is `string`, this will be case-insensitive
		 * If type is `channel`, `member`, `role`, or `user`, this will be the IDs.
		 * @type {?string[]}
		 */
		this.oneOf = typeof info.oneOf !== 'undefined' ? info.oneOf : null;

		/**
		 * Whether the argument accepts an infinite number of values
		 * @type {boolean}
		 */
		this.infinite = Boolean(info.infinite);

		/**
		 * Validator function for validating a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#validate}
		 */
		this.validator = info.validate || null;

		/**
		 * Parser function for parsing a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#parse}
		 */
		this.parser = info.parse || null;

		/**
		 * Function to check whether a raw value is considered empty
		 * @type {?Function}
		 * @see {@link ArgumentType#isEmpty}
		 */
		this.emptyChecker = info.isEmpty || null;

		/**
		 * How long to wait for input (in seconds)
		 * @type {number}
		 */
		this.wait = typeof info.wait !== 'undefined' ? info.wait : 30;
	}

	/**
	 * Result object from obtaining a single {@link Argument}'s value(s)
	 * @typedef {Object} ArgumentResult
	 * @property {?*|?Array<*>} value - Final value(s) for the argument
	 * @property {?string} cancelled - One of:
	 * - `user` (user cancelled)
	 * - `time` (wait time exceeded)
	 * - `promptLimit` (prompt limit exceeded)
	 * @property {Message[]} prompts - All messages that were sent to prompt the user
	 * @property {Message[]} answers - All of the user's messages that answered a prompt
	 */

	/**
	 * Prompts the user and obtains the value for the argument
	 * @param {CommandoMessage} msg - Message that triggered the command
	 * @param {string} [val] - Pre-provided value for the argument
	 * @param {number} [promptLimit=Infinity] - Maximum number of times to prompt for the argument
	 * @return {Promise<ArgumentResult>}
	 */
	async obtain(msg, val, promptLimit = Infinity) {
		let empty = this.isEmpty(val, msg);
		if(empty && this.default !== null) {
			return {
				value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
				cancelled: null,
				prompts: [],
				answers: []
			};
		}
		if(this.infinite) return this.obtainInfinite(msg, val, promptLimit);

		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		const prompts = [];
		const answers = [];
		let valid = !empty ? await this.validate(val, msg) : false;

		while(!valid || typeof valid === 'string') {
			/* eslint-disable no-await-in-loop */
			if(prompts.length >= promptLimit) {
				return {
					value: null,
					cancelled: 'promptLimit',
					prompts,
					answers
				};
			}

			// Prompt the user for a new value
			prompts.push(await msg.reply(stripIndents`
				${empty ? this.prompt : valid ? valid : `Você forneceu um inválido ${this.label}. Tente novamente.`}
				${oneLine`
					Responda com \`cancel\` para cancelar o comando.
					${wait ? `O comando vai ser cancelado em ${this.wait} segundos.` : ''}
				`}
			`));

			// Get the user's response
			const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
				max: 1,
				time: wait
			});

			// Make sure they actually answered
			if(responses && responses.size === 1) {
				answers.push(responses.first());
				val = answers[answers.length - 1].content;
			} else {
				return {
					value: null,
					cancelled: 'time',
					prompts,
					answers
				};
			}

			// See if they want to cancel
			if(val.toLowerCase() === 'cancel') {
				return {
					value: null,
					cancelled: 'user',
					prompts,
					answers
				};
			}

			empty = this.isEmpty(val, msg);
			valid = await this.validate(val, msg);
			/* eslint-enable no-await-in-loop */
		}

		return {
			value: await this.parse(val, msg),
			cancelled: null,
			prompts,
			answers
		};
	}

	/**
	 * Prompts the user and obtains multiple values for the argument
	 * @param {CommandoMessage} msg - Message that triggered the command
	 * @param {string[]} [vals] - Pre-provided values for the argument
	 * @param {number} [promptLimit=Infinity] - Maximum number of times to prompt for the argument
	 * @return {Promise<ArgumentResult>}
	 * @private
	 */
	async obtainInfinite(msg, vals, promptLimit = Infinity) { // eslint-disable-line complexity
		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		const results = [];
		const prompts = [];
		const answers = [];
		let currentVal = 0;

		while(true) { // eslint-disable-line no-constant-condition
			/* eslint-disable no-await-in-loop */
			let val = vals && vals[currentVal] ? vals[currentVal] : null;
			let valid = val ? await this.validate(val, msg) : false;
			let attempts = 0;

			while(!valid || typeof valid === 'string') {
				attempts++;
				if(attempts > promptLimit) {
					return {
						value: null,
						cancelled: 'promptLimit',
						prompts,
						answers
					};
				}

				// Prompt the user for a new value
				if(val) {
					const escaped = escapeMarkdown(val).replace(/@/g, '@\u200b');
					prompts.push(await msg.reply(stripIndents`
						${valid ? valid : oneLine`
							Você inseriu um inválido ${this.label},
							"${escaped.length < 1850 ? escaped : '[muito tempo para mostrar]'}".
							Por favor, tente novamente.
						`}
						${oneLine`
							Responda com \`cancel\` para cancelar o comando, ou \`finish\` para concluir a entrada até este ponto.
							${wait ? `O comando vai ser cancelado automaticamente em ${this.wait} segundos.` : ''}
						`}
					`));
				} else if(results.length === 0) {
					prompts.push(await msg.reply(stripIndents`
						${this.prompt}
						${oneLine`
						Responda com \`cancel\` para cancelar o comando, ou \`finish\` para concluir a entrada até este ponto.
						${wait ? `O comando vai ser cancelado automaticamente em ${this.wait} segundos.` : ''}
						`}
					`));
				}

				// Get the user's response
				const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
					max: 1,
					time: wait
				});

				// Make sure they actually answered
				if(responses && responses.size === 1) {
					answers.push(responses.first());
					val = answers[answers.length - 1].content;
				} else {
					return {
						value: null,
						cancelled: 'time',
						prompts,
						answers
					};
				}

				// See if they want to finish or cancel
				const lc = val.toLowerCase();
				if(lc === 'finish') {
					return {
						value: results.length > 0 ? results : null,
						cancelled: this.default ? null : results.length > 0 ? null : 'user',
						prompts,
						answers
					};
				}
				if(lc === 'cancel') {
					return {
						value: null,
						cancelled: 'user',
						prompts,
						answers
					};
				}

				valid = await this.validate(val, msg);
			}

			results.push(await this.parse(val, msg));

			if(vals) {
				currentVal++;
				if(currentVal === vals.length) {
					return {
						value: results,
						cancelled: null,
						prompts,
						answers
					};
				}
			}
			/* eslint-enable no-await-in-loop */
		}
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} val - Value to check
	 * @param {CommandoMessage} msg - Message that triggered the command
	 * @return {boolean|string|Promise<boolean|string>}
	 */
	validate(val, msg) {
		const valid = this.validator ? this.validator(val, msg, this) : this.type.validate(val, msg, this);
		if(!valid || typeof valid === 'string') return this.error || valid;
		if(valid instanceof Promise) return valid.then(vld => !vld || typeof vld === 'string' ? this.error || vld : vld);
		return valid;
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} val - Value to parse
	 * @param {CommandoMessage} msg - Message that triggered the command
	 * @return {*|Promise<*>}
	 */
	parse(val, msg) {
		if(this.parser) return this.parser(val, msg, this);
		return this.type.parse(val, msg, this);
	}

	/**
	 * Checks whether a value for the argument is considered to be empty
	 * @param {string} val - Value to check for emptiness
	 * @param {CommandoMessage} msg - Message that triggered the command
	 * @return {boolean}
	 */
	isEmpty(val, msg) {
		if(this.emptyChecker) return this.emptyChecker(val, msg, this);
		if(this.type) return this.type.isEmpty(val, msg, this);
		if(Array.isArray(val)) return val.length === 0;
		return !val;
	}

	/**
	 * Validates the constructor parameters
	 * @param {CommandoClient} client - Client to validate
	 * @param {ArgumentInfo} info - Info to validate
	 * @private
	 */
	static validateInfo(client, info) { // eslint-disable-line complexity
		if(!client) throw new Error('O cliente do argumento deve ser especificado.');
		if(typeof info !== 'object') throw new TypeError('As informações do argumento devem ser um objeto.');
		if(typeof info.key !== 'string') throw new TypeError('A chave do argumento deve ser uma sequência.');
		if(info.label && typeof info.label !== 'string') throw new TypeError('O rótulo do argumento deve ser uma sequência.');
		if(typeof info.prompt !== 'string') throw new TypeError('O prompt do argumento deve ser uma sequência.');
		if(info.error && typeof info.error !== 'string') throw new TypeError('O erro do argumento deve ser uma sequência.');
		if(info.type && typeof info.type !== 'string') throw new TypeError('O tipo de argumento deve ser uma sequência.');
		if(info.type && !info.type.includes('|') && !client.registry.types.has(info.type)) {
			throw new RangeError(`O tipo "${info.type}" desse argumento não foi registrado.`);
		}
		if(!info.type && !info.validate) {
			throw new Error('O argumento deve ter "type" ou "validate" especificado.');
		}
		if(info.validate && typeof info.validate !== 'function') {
			throw new TypeError('A validação de argumento deve ser uma função.');
		}
		if(info.parse && typeof info.parse !== 'function') {
			throw new TypeError('A análise de argumentos deve ser uma função.');
		}
		if(!info.type && (!info.validate || !info.parse)) {
			throw new Error('O argumento deve ter validar e analisar, pois não possui um tipo.');
		}
		if(typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || Number.isNaN(info.wait))) {
			throw new TypeError('A espera do argumento deve ser um número.');
		}
	}

	/**
	 * Gets the argument type to use from an ID
	 * @param {CommandoClient} client - Client to use the registry of
	 * @param {string} id - ID of the type to use
	 * @returns {?ArgumentType}
	 * @private
	 */
	static determineType(client, id) {
		if(!id) return null;
		if(!id.includes('|')) return client.registry.types.get(id);

		let type = client.registry.types.get(id);
		if(type) return type;
		type = new ArgumentUnionType(client, id);
		client.registry.registerType(type);
		return type;
	}
}

module.exports = Argument;
