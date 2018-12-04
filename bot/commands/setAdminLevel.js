const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let newLevel = Number(params[0]);
	let user     = helper.getUser(params.splice(1, params.length).join(' '), bot);

	if (!user) return msg.reply(`No user given or user wasn't not found`);

	let doc = guildDocument.admins.id(user.id);
	let isRemoving = (newLevel == 0 && doc);
	let successMsg;

	if (newLevel < 1 || newLevel > 3 || isNaN(newLevel))
		if (!isRemoving)
			return msg.reply(`Admin levels must be in the range of 1 - 3.\nIf removing admin set second parameter to 0`);

	if (doc)
		if (doc.level == newLevel)
			return msg.reply(`You must set a different level than the current`);

	if (doc) {
		if (newLevel == 0) {
			doc.remove();
			successMsg = `Removed ${user.username} (${user.id}) as admin`;
		} else {
			doc.level = newLevel;
			successMsg = `Updated level for ${user.username} (${user.id}) to level ${newLevel}`;
		}
	} else {
		guildDocument.admins.push({_id: user.id, level: newLevel});
		successMsg = `Saved ${user.username} (${user.id}) as admin with level ${newLevel}`;
	}

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(successMsg);
		else msg.reply('Error saving document');
	});
};
