const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let event   = params[0];
	let channel = params.splice(1, params.length).join(' ').trim();

	if (!channel) channel = msg.channel;
	else channel = helper.getChannel(channel, msg.guild);

	if (!event || !channel)
		return msg.reply(`Your missing parameters for this command`);

	if (!guildDocument.notifications[event])
		return msg.reply(`That isn't an available event notification name`);

	if (guildDocument.notifications[event].channel_id == channel.id)
		return msg.reply('You must set a different channel than the one already set.');

	guildDocument.notifications[event].channel_id = channel.id;

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(`Channel for notification ${event} has been updated to ${product.notifications[event].channel_id}`);
		else msg.reply('Error saving document');
	});
};
