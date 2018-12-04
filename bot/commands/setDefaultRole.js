const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let role = helper.getRole(params.join(' ').trim(), msg.guild);

	if (!role) return msg.reply(`No role set or role could't be found`);

	guildDocument.default_role = role.id;
	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(`Default role has been changed to ${role.name} (${role.id})`);
		else msg.reply('Error saving document');
	});
};