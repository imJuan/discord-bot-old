const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	// Get role given
	let role = helper.getRole(params.join(' ').trim(), msg.guild);
	if (!role) return msg.reply(`Couldn't find role given.`);

	// Prompt author for member name
	let awaitMsg;
	msg.reply(`Who would you like to add the role ${role.toString()} to?\nReply with 'cancel' to end the command`)
	.then(m => awaitMsg = m);

	// Wait for user response
	let awaitFilter = m => {return m.author.id == msg.author.id};
	msg.channel.awaitMessages(awaitFilter, {max: 1, time: 60000, errors: ['time']})
	.then(collected => {
		// We only want one message
		let userReply = collected.first();

		// Check if author cancelled
		if (userReply.content == 'cancel') throw 'User canceled';

		// Get member from author response
		let member = helper.getMember(userReply.content, msg.guild);
		if (!member) throw `Couldn't find member`;

		// Add the role to member
		member.addRole(role)
		.then(() => {
			msg.reply(`Successfully added the role ${role.toString()} to ${member.user.toString()}.`);
		})
		.catch(err => {
			msg.reply(`Couldn't add role, ${err}`);
		});

		// Clean up
		msg.delete();
		awaitMsg.delete();
		userReply.delete();
	})
	.catch(err => {
		// Some shit went down
		msg.reply(`Action Cancelled, ${err}`);

		// Clean up
		msg.delete();
		awaitMsg.delete();
	});
};