const now = require('performance-now');
const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	let startTime = now();
	msg.channel.sendMessage("Ping Pong!")
	.then(message => {
		let endTime = now();
		return message.edit(`Ping took ${(endTime - startTime).toFixed(3)} ms.`);
	});
};
