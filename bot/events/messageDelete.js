const helper = require('../helper');
const discord = require('discord.js');

module.exports = (bot, db, message) => {
	db.guilds.findOne({_id: message.guild.id}, (err, result) => {
		if (err) return helper.handleError(bot, db);

		let message_deleted = result.notifications.message_deleted;
		if (message_deleted.enabled) {
			if (message_deleted.channel_ids.indexOf(message.channel.id) != -1) {
				if (message_deleted.channel_id && message.cleanContent && !message.author.bot) {
					let embed = new discord.RichEmbed()
					.setAuthor(`${message.author.username} #${message.author.discriminator}`)
					.setColor('#6600ff')
					.setTitle('Message Deleted')
					.addField('Content:', message.cleanContent)
					.setFooter(new Date(message.createdTimestamp));

					bot.channels.get(message_deleted.channel_id)
					.sendEmbed(embed, '', {disableEveryone: true})
					.catch(err => helper.handleError(bot, err));
				}
			}
		}
	});
};