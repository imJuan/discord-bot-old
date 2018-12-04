const helper   = require('../helper');
const commands = require('../config/commands.json');

module.exports = (bot, db, msg) => {
	if (msg.author.bot) return;
	if (msg.channel.type == 'dm')
		return msg.reply(`I don't work here :(`);

	// Make sure user exist in database
	helper.dbMemberExist(bot, db, msg.guild, msg.member, false);

	// Update member stats
	db.guilds.findOne({_id: msg.guild.id}, (err, result) => {
		if (err || !result) return helper.handleError(bot, err || `Couldn't find guild`);

		let memberDoc = result.members.id(msg.member.user.id);
		if (memberDoc) {
			memberDoc.msg_amount ++;
			result.save((err) => {
				if (err) return helper.handleError(bot, err);
			});
		}
	});

	// Check for command usage
	if (msg.content.startsWith('>>')) {
		let content   = msg.content.substr(2);
		let cmdName   = content.split(' ')[0].toLowerCase();
		let cmdParams = content.substring(cmdName.length + 1).split(' ');

		if (!cmdName) return;

		if (msg.channel.type == 'dm') {
			msg.reply(`I don't work here :(`);
		} else {
			db.guilds.findOne({_id: msg.guild.id}, (err, result) => {
				if (err) return helper.handleError(bot, err, msg);

				if (!msg.guild.available)
					return msg.reply(`Guild, ${msg.guild.name}, isn't available at the moment`);

				// Check if command is available
				let command = result.commands[cmdName];
				if (!command && commands.public[cmdName])
					return helper.toServer(bot, `Command, '${cmdName}', wasn't found in ${msg.guild.name} (${msg.guild.id}) database.`);
				if (!command || !command.enabled)
					return msg.reply(`That isn't a command`);

				helper.getAdminLevel(db, msg.author, msg.guild, userLevel => {
					// Check if user is allowed to use command
					if (userLevel < command.staff_level)
						return msg.reply(`Your not allowed to use this command`);

					// Do command
					let action;
					try {
						action  = require(`../commands/${cmdName}`);
					} catch (err) {
						return helper.handleError(bot, err, msg);
					}
					action(bot, db, result, msg, cmdParams);
				});
			});
		}
	}
};
