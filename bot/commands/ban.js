const helper = require('../helper');

module.exports = (bot, db, guildDocument, msg, params) => {
	helper.modAction(bot, db, 'Ban', msg, params);
};