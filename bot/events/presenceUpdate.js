const helper = require('../helper');

module.exports = (bot, db, oldMember, newMember) => {
	db.guilds.findOne({_id: newMember.guild.id}, (err, result) => {
		if (err) return helper.handleError(bot, err);

		// Member OFFLINE
		if (oldMember.presence.status == 'online' && newMember.presence.status == 'offline') {
			// Notification
			let member_offline = result.notifications.member_offline;
			if (member_offline.enabled) {
				let message = member_offline.message.replace(/@user/g, newMember.user.toString());
				if (member_offline.channel_id)
					bot.channels.get(member_offline.channel_id).sendMessage(message);
			}
		}

		// Member ONLINE
		if (oldMember.presence.status == 'offline' && newMember.presence.status == 'online') {
			// Notification
			let member_online = result.notifications.member_online;
			if (member_online.enabled) {
				let message = member_online.message.replace(/@user/g, newMember.user.toString());
				if (member_online.channel_id)
					bot.channels.get(member_online.channel_id).sendMessage(message);
			}

			// Update member login or add to db if doesnt exist
			let memberDoc = result.members.id(oldMember.user.id);
			if (memberDoc) {
				memberDoc.last_login = new Date();
				result.save((err, product, numAffected) => {
					if (err) return helper.handleError(bot, err);
				});
			} else {
				helper.dbMemberExist(bot, db, oldMember.guild, oldMember);
			}
		}
	});
};