const helper = require('../helper');

module.exports = (bot, db, server) => {
	helper.toServer(bot, `Client left guild ${server.name} ${server.id}`);

	db.guilds.remove({_id: server.id}, (err) => {
		if (err)
			helper.handleError(bot, err, true);
		else
			helper.toServer(bot, `Guild ${server.id} removed from database.`)
	});
};