const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params)  => {
	let user = helper.getUser(params.join(' '), bot);
	if (!user) return msg.reply(`Couldn't find user.`);

	let memberDoc = guildDocument.members.id(user.id);
	if (!memberDoc) return msg.reply(`Couldn't find member in database`);

	msg.reply(`${user.username} #${user.discriminator} was last seen on ${memberDoc.last_login}`);
};