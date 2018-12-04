const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params)  => {
	let amount = params[0];
	msg.channel.fetchMessages({limit: amount})
	.then(messages => {
		msg.channel.bulkDelete(messages, true)
		.then(() => {
			msg.reply(`Deleted ${amount} messages`)
			.then(m => m.delete(5000));
		})
		.catch(err => msg.reply(`Couldn't Delete messages, ${err}.\n*Note, You can only delete messages within the past 2 weeks.`));
	});
};
