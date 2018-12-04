const helper = require('../helper');
const discord = require('discord.js');

module.exports = (bot, db, guildDocument, msg, params)  => {
	let user = helper.getUser(params.join(' '), bot);
	if (!user) return msg.reply(`Couldn't find user.`);

	let memberDoc = guildDocument.members.id(user.id);
	if (!memberDoc) return msg.reply(`Couldn't find member in database`);

	try {
		let embed = new discord.RichEmbed()
		.setAuthor(`${user.username} #${user.discriminator}`, user.avatarURL)
		.setColor('#ffffff')
		.setThumbnail(user.avatarURL)
		.setDescription(
			`Messages: ${memberDoc.msg_amount}
			ID: ${user.id}`
		)
		.setFooter(`Last login: ${memberDoc.last_login}`);

		msg.channel.sendEmbed(embed, user.toString(), {disableEveryone: true});
	} catch (err) {
		helper.handleError(bot, err, msg);
	}
};