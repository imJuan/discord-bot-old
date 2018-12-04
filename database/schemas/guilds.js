const mongoose = require("mongoose");
const commands = require('../../bot/config/commands.json');

function getCommands() {
	const cmds = {};

	for (const command in commands['public'])
		cmds[command] = {
			enabled: {type: Boolean, default: commands['public'][command].defaults.enabled},
			staff_level: {type: Number, min: 0, max: 3, default: commands['public'][command].defaults.staff_level}
		};

	return cmds;
}

module.exports = new mongoose.Schema({
	_id: {type: String, required: true},
	admins: [new mongoose.Schema({
		_id: {type: String, required: true},
		level: {type: Number, default: 1, enum: [1, 2, 3]}
	})],
	members: [require('./guildMember')],
	notifications: require("./guildNotifications"),
	mod_log: require('./guildModLog'),
	commands: getCommands(),
	default_role: String
});
