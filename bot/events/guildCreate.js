const helper = require('../helper');

module.exports = (bot, db, server) => {
	helper.toServer(bot, `Client joined guild '${server.name}' (${server.id})`);

	db.guilds.findOne({_id: server.id}, (err, result) => {
		if (err) return helper.handleError(bot, err, false);

		if (!result) {
			db.guilds.create(new db.guilds({_id: server.id}), error => {
				if (error)
					helper.handleError(bot, error, true);
				else
					helper.toServer(bot, `Guild ${server.id} added to database`);
			});
		}
	});
};
