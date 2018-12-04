const helper = require('../helper');

/*
	Separated to get its own admin level in db
 */

module.exports = (bot, db, guildDocument, msg, params) => {
	let channel = helper.getChannel(params.join(' ').trim(), msg.guild);
	let successMsg = 'Error';

	if (!channel) {
		if (!guildDocument.mod_log.channel_id)
			return msg.reply('Logging is already disabled');

		guildDocument.mod_log.enabled = false;
		guildDocument.mod_log.channel_id = '';

		successMsg = `Disabled moderation logs`;
	} else {
		if (channel.id == guildDocument.mod_log.channel_id)
			return msg.reply(`You must give different channel than the one already set`);

		guildDocument.mod_log.enabled = true;
		guildDocument.mod_log.channel_id = channel.id;

		successMsg = `Now logging moderation actions to channel ${channel.name} (${channel.id})`;
	}

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(successMsg);
		else msg.reply('Error saving document');
	});
};