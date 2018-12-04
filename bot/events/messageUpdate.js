const helper = require('../helper');
const discord = require('discord.js');

module.exports = (bot, db, oldMessage, newMessage) => {
	if (oldMessage.author.bot) return;

	db.guilds.findOne({_id: newMessage.guild.id}, (err, result) => {
		if (err) return helper.handleError(bot, err);
		if (!result) return;

		// Message EDITED notification
		let message_edited = result.notifications.message_edited;
		if (message_edited.enabled) {
			if (oldMessage.content != newMessage.content) {
				if (message_edited.channel_ids.indexOf(newMessage.channel.id) != -1) {
					let embed = new discord.RichEmbed()
					.setAuthor(`${newMessage.author.username} #${newMessage.author.discriminator}`, newMessage.author.avatarURL)
					.setColor('#00a1ff')
					.setTitle('Message edited')
					.addField('Original:', oldMessage.cleanContent)
					.addField('Edit:', newMessage.cleanContent)
					.setFooter(new Date(oldMessage.createdTimestamp));

					if (message_edited.channel_id)
						bot.channels.get(message_edited.channel_id).sendEmbed(embed, '', {disableEveryone: true})
						.catch(err => helper.handleError(bot, err));
				}
			}
		}
	});
};