const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let event   = params[0];
	let channel = params.splice(1, params.length).join(' ');
	let newChannel;

	if (!channel) channel = msg.channel;
	else channel = helper.getChannel(channel, msg.guild);

	if (['message_deleted', 'message_edited'].indexOf(event) < 0)
		return msg.reply(`That isn't an available event to use with this command.`);

	let doc = guildDocument.notifications[event];
	if (doc.channel_ids.indexOf(channel.id) != -1) {
		let index = doc.channel_ids.indexOf(channel.id);
		doc.channel_ids.splice(index, 1);
		newChannel = false;
	} else {
		newChannel = true;
		doc.channel_ids.push(channel.id);
	}

	guildDocument.save((err, product, numAffected) => {
		if (err) return helper.handleError(bot, err, msg);
		if (numAffected > 0) msg.reply(`${newChannel ? 'Added' : 'Removed'} the channel ${channel.name} (${channel.id}) from the event ${event}`);
		else msg.reply('Error saving document');
	});
};
