const discord = require('discord.js');
const mongoose = require('mongoose');
const config  = require('./config/config.json');

/*
	Get discord objs
 */
function getChannel(query, guild) {
	let channel;

	if (query.indexOf("<#") == 0)
		channel = guild.channels.get(query.substring(2, query.length - 1));
	else
		channel = guild.channels.find('name', query);

	return channel;
}

function getRole(query, guild) {
	let role;

	if (!isNaN(query))
		role = guild.roles.get(query);
	else
		role = guild.roles.find('name', query);

	return role;
}

function getUser(query, bot) {
	let user;

	if(!isNaN(query)) {
		user = bot.users.get(query);
	} else if (query.indexOf("<@") == 0) {
		user = bot.users.get(query.substring(2, query.length - 1));
	} else {
		if(query.indexOf("@") == 0)
			query = query.slice(1);
		user = bot.users.find("username", query);
	}

	return user;
}

function getMember(query, guild) {
	let member;

	if(!isNaN(query)) {
		member = guild.members.get(query);
	} else if (query.indexOf("<@") == 0) {
		member = guild.members.get(query.substring(2, query.length - 1));
	} else {
		if(query.indexOf("@") == 0)
			query = query.slice(1);
		member = guild.members.find(val => val.user.username === query);
	}

	return member;
}

/*
	Send to my personal servers logging channel
	and reply to person if message obj is given
 */
function handleError(bot, err, replyMsg) {
	console.log(err);
	toServer(bot, err, true);

	//err = (err.message == '' ? err : err.message);
	if (replyMsg)
		replyMsg.reply(err);
}

/*
	Send to my personal servers log channel
 */
function toServer(bot, msg, code) {
	if (code)
		bot.channels.get(config.global_logging_channel).sendCode('Markdown', msg);
	else
		bot.channels.get(config.global_logging_channel).sendMessage('`' + msg + '`');
}

/*
	Send moderation actions to servers log channel
 */
function sendModLog(bot, db, msg, user, action, reason) {
	db.guilds.findOne({_id: msg.guild.id}, (err, result) => {
		if (err) return handleError(bot, err, msg);
		if (!result) return;

		let entry = new db.logentries({
			guild_id: result._id,
			action: action,
			createdAt: new Date(),
			user: user.id,
			staff: msg.author.id,
			reason: reason
		});

		db.logentries.create(entry, error => {
			if (error) return handleError(bot, error, msg);
			saveModLog(result, entry._id, msg, user, action, reason);
		});

		if (action == 'Ban   asxas') {
			let bannedUser = result.members.id(user.id);
			bannedUser.banned = user;
			result.save((err, product, numAffected) => {
				if (err) return handleError(bot, err);
				if (numAffected > 0) return console.log('saved');
				else console.log('not saved');
			});
		}
	});
}

function saveModLog(doc, entryID, msg, user, action, reason) {
	var colors = {
		Warn: {value: '#f4f007'},
		Kick: {value: '#ff6e00'},
		Ban: {value: '#ff0000'},
		Unban: {value: '#32ff00'}
	};

	if (doc.mod_log.enabled && doc.mod_log.channel_id) {
		let embed = new discord.RichEmbed()
		.setAuthor(msg.author.username, msg.author.avatarURL)
		.setColor(colors[action].value)
		.setURL('xxx')
		.setDescription(`**Action**: ${action}\n**User**: ${user.username} (${user.id})\n**Reason**: ${reason}`)
		.setFooter(`ID: ${entryID}`, null);

		msg.guild.channels.get(doc.mod_log.channel_id)
		.sendEmbed(embed, '', {disableEveryone: true})
		.catch(er => console.error(er));
	} else {
		msg.reply(`Kicked member ${user.toString()}`);
	}
}

function getAdminLevel(db, user, guild, callback) {
	if (user.id == guild.owner.id)
		return callback(3);

	db.guilds.findOne({_id: guild.id}, (err, result) => {
		if (!err && result) {
			let admin = result.admins.id(user.id);
			if (admin)
				return callback(admin.level);
			else
				return callback(-1);
		} else {
			return callback(-1);
		}
	});
}

function modAction(bot, db, action, msg, params) {
	// Get user or member object
	var user, member, awaitMessage;
	if (action == 'Unban') {
		user = getUser(params.join(' '), bot);
		if (!user) return msg.reply(`Couldn't find user`);
	} else {
		member = getMember(params.join(' '), msg.guild);
		if (!member) return msg.reply(`Couldn't find member`);
	}

	// Prompt author for response
	msg.reply(`Please reply with your reason.\nReply \`cancel\` to cancel the command`)
	.then(m => awaitMessage = m);

	// Wait for authors response
	let filter = m => { return m.author.id == msg.author.id; };
	msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']})
	.then(collected => {
		// Only want first message
		let replyMsg = collected.first();

		// Check if author cancelled
		if (replyMsg.content == 'cancel') throw 'User cancelled';

		// Get reason text
		let userReply = replyMsg.content;
		if (userReply.length < 4) throw 'Reason was to short';

		// Do appropriate action
		doAction(action, member, user, msg, replyMsg)
		.then(() => {
			sendModLog(bot, db, msg, (member ? member.user : user), [action], userReply);
		})
		.catch(err => {
			msg.reply(`Something went wrong when completing command, ${err}`);
		});

		msg.delete();
		replyMsg.delete();
		awaitMessage.delete();
	})
	.catch((err) => {
		msg.reply(`${err}`);
		msg.delete();
		awaitMessage.delete();
	});
}

function doAction(action, member, user, msg, reason) {
	switch (action) {
		case "Kick":
			return member.kick();

		case "Warn":
			return warnMember(member, reason, msg);

		case "Ban":
			return msg.guild.ban(member.user.id);

		case "Unban":
			return msg.guild.unban(user);
	}
}

function warnMember(member, reason, msg) {
	let success, error;
	let embed = new discord.RichEmbed()
	.setColor('#f4f007')
	.setURL('xxx')
	.setDescription(`**Warning**: ${reason}`);

	member.user.sendEmbed(embed, 'You received a warning', {disableEveryone: true})
	.then(() => {
		msg.reply(`Sent warning to ${member.user.username}`);
		success = true;
	})
	.catch(err => {
		success = false;
		error = err;
	});

	return new Promise( (resolve, reject) => {
		setTimeout(() => {
			if (success) resolve(`Sent successfully`);
			else reject(`Couldn't send warning to ${member.user.username}, ${error}`);
		}, 1000);
	});
}

function dbMemberExist(bot, db, guild, member, returnObj) {
	dbUserExist(bot, db, member.user);

	db.guilds.findOne({_id: guild.id}, (err, result) => {
		if (err || !result) return handleError(bot, err || `Couldn't find guild`);

		let memberDoc = result.members.id(member.user.id);
		if (!memberDoc) {
			result.members.push({_id: member.user.id});
			result.save((err, product, numAffected) => {
				if (err) return handleError(bot, err);
				if (numAffected > 0) return (returnObj == true ? product : true);
				else return false;
			});
		} else {
			if (returnObj) return memberDoc;
			else return true;
		}
	});
}

function dbUserExist(bot, db, user, returnObj) {
	db.users.findOne({_id: user.id}, (err, result) => {
		if (err) return handleError(bot, err);

		if (!result) {
			db.users.create(new db.users({_id: user.id, discriminator: user.discriminator, past_names: user.username}), error => {
				if (error) handleError(bot, error);
				else toServer(bot, `User ${user.id} added to database`);
			});
		}
	});
}

module.exports = {
	handleError: handleError,
	toServer: toServer,
	modAction: modAction,
	getChannel: getChannel,
	getRole: getRole,
	getUser: getUser,
	getMember: getMember,
	getAdminLevel: getAdminLevel,
	dbUserExist: dbUserExist,
	dbMemberExist: dbMemberExist
};
