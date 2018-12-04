const commands = require('../config/commands.json');

function getHelp(type) {
	let cmds = `${type.charAt(0).toUpperCase() + type.slice(1)} Commands\n`;

	for (let command in commands[type]) {
		cmds += `>>${command} `;
		for (let i = 0; i < commands[type][command].params.length; i++) {
			if (commands[type][command].params[i].optional)
				cmds += `[${commands[type][command].params[i].name}]`;
			else
				cmds += commands[type][command].params[i].name;

			if (i != commands[type][command].params.length - 1)
				cmds += `, `;
		}
		cmds += `\n${commands[type][command].description}\n\n`;
	}

	cmds += '\n* Parameters surrounded in [brackets] are optional for that command';
	return cmds;
}

module.exports = (bot, db, guildDocument, msg, params) => {
	let help;

	if (msg.channel.type == 'dm')
		help = getHelp(`private`);
	else
		help = getHelp('public');

	msg.author.sendCode('Markdown', help)
	.then(msg.delete());
};