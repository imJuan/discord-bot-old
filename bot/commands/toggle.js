const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let event = params[0];

	if (!guildDocument.notifications[event]) return msg.reply(`That isn't an available event notification name`);

	guildDocument.notifications[event].enabled = !guildDocument.notifications[event].enabled;

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(`Notification ${event} has been ${product.notifications[event].enabled == true ? 'ENABLED' : 'DISABLED'}`);
		else msg.reply('Error saving document');
	});
};
