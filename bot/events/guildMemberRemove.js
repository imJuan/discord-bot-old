const helper = require('../helper');

module.exports = (bot, db, member) => {
	db.guilds.findOne({_id: member.guild.id}, (err, result) => {
		if (err) helper.handleError(bot, err, false);

		//todo: remove from database if not banned

		let notification = result.notifications.member_remove;

		if (notification.enabled && notification.message) {
			let message = notification.message.replace(/@user/g, member.user.toString());
			if (notification.channel_id)
				bot.channels.get(notification.channel_id).sendMessage(message);
		}
	});
};
