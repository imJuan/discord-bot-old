const helper = require('../helper');

module.exports = (bot, db, member) => {
	db.guilds.findOne({_id : member.guild.id}, (err, result) => {
		if (err) return helper.handleError(bot, err, false);

		// Make sure member is in database
		helper.dbMemberExist(bot, db, member.guild, member, false);

		// Add default role if any
		if (result.default_role)
			member.addRoles([result.default_role]);

		// Send new_member message
		let notification = result.notifications.member_add;
		if (notification.enabled && notification.message) {
			let message = notification.message.replace(/@user/g, member.user.toString());
			if (notification.channel_id)
				bot.channels.get(notification.channel_id).sendMessage(message);
		}
	});
};
