const discord      = require('discord.js');
const helper       = require('./helper');
const authDetails  = require('./config/auth.json');
const bot          = new discord.Client();

const eventHandlers = {
	ready: require('./events/ready'),
	message: require('./events/message'),
	guildCreate: require('./events/guildCreate'),
	guildDelete: require('./events/guildDelete'),
	guildMemberAdd: require('./events/guildMemberAdd'),
	guildMemberRemove: require('./events/guildMemberRemove'),
	presenceUpdate: require('./events/presenceUpdate'),
	messageUpdate: require('./events/messageUpdate'),
	messageDelete: require('./events/messageDelete')
};

module.exports = (db) => {
	bot.on('ready', () => {
		eventHandlers.ready(bot, db);
	});

	bot.on('message', msg => {
		eventHandlers.message(bot, db, msg);
	});

	bot.on('guildCreate', guild => {
		eventHandlers.guildCreate(bot, db, guild);
	});

	bot.on('guildDelete', guild => {
		eventHandlers.guildDelete(bot, db, guild);
	});

	bot.on('guildMemberAdd', member => {
		eventHandlers.guildMemberAdd(bot, db, member);
	});

	bot.on('guildMemberRemove', member => {
		eventHandlers.guildMemberRemove(bot, db, member);
	});

	bot.on('presenceUpdate', (oldMember, newMember) => {
		eventHandlers.presenceUpdate(bot, db, oldMember, newMember);
	});

	bot.on('messageUpdate', (oldMessage, newMessage) => {
		eventHandlers.messageUpdate(bot, db, oldMessage, newMessage);
	});

	bot.on('messageDelete', message => {
		eventHandlers.messageDelete(bot, db, message);
	});

	bot.on('error', e => { console.error(e); });
	bot.on('warn', e => { console.warn(e); });
	bot.on('debug', e => { console.info(e); });

	console.log('Bot logging in...');
	bot.login(authDetails.token);

	// Start up web server
	var web = require('../web/web')(db, bot);
};
