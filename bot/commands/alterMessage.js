const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let event   = params[0];
	let message = params.splice(1, params.length).join(' ').trim();

	if (!event || !message)
		return msg.reply(`Your missing parameters for this command`);

	if (!guildDocument.notifications[event])
		return msg.reply(`That isn't an available event notification name`);

	guildDocument.notifications[event].message = message;

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(`Message for notification ${event} has been updated to '${product.notifications[event].message}'`);
		else msg.reply('Error saving document');
	});
};