const helper = require('../helper');

function rotateGames(bot, i) {
	let games = [
		'Type: >>help',
	];
	if (i >= games.length) i = 0;
	bot.user.setGame(games[i]);
	setTimeout( () => {
		rotateGames(bot, ++i);
	}, 20000);
}

module.exports = (bot, db) => {
	helper.toServer(bot, `\`Bot is ready! ${new Date()}\``);
	helper.toServer(bot, `DB Connection: ${process.env.OPENSHIFT_MONGODB_DB_URL}`);
	rotateGames(bot, 0);

	// remove guilds from database if they aren't stored in client
	db.guilds.find({}, (err, result) => {
		if (err) return helper.handleError(bot, err, true);

		result.forEach(guildDb => {
			if (!bot.guilds.get(guildDb._id)) {
				helper.toServer(bot, `Guild with id ${guildDb._id} no longer stored in client. Removing from database`);

				db.guilds.remove({_id: guildDb._id}, (error) => {
					if (error) return helper.handleError(bot, error, true);
					helper.toServer(bot, `Guild, ${guildDb._id}, removed successfully`);
				});
			}
		});
	});

	// Make sure every guild is saved in database
	bot.guilds.every(server => {
		db.guilds.findOne({_id: server.id}, (err, result) => {
			if (err) return helper.handleError(bot, err);

			if (!result)
				db.guilds.create(new db.guilds({_id: server.id}), error => {
					if (error) helper.handleError(bot, error);
					else helper.toServer(bot, `New Server! Added ${server.name} (${server.id}) to servers database`);
				});
		});
	});
};

