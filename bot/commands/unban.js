const helper = require('../helper');

//todo: user not found
module.exports = (bot, db, guildDocument, msg, params) => {
	helper.modAction(bot, db, 'Unban', msg, params);
};