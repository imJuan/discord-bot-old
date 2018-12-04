const mongoose = require("mongoose");
const config   = require('./config/config.json');

// Couldn't Connect
mongoose.connection.on('error', err => {
	console.error(err);
});

// Connect successful
mongoose.connection.once('open', err => {
	if (err) {
		console.error(err);
	} else {
		mongoose.model('guilds', require('./schemas/guilds'));
		mongoose.model('logentries', require('./schemas/modLogEntry'));
		mongoose.model('users', require('./schemas/users'));

		console.log('Database is ready!');

		// Start up bot
		try {
			require('../bot/bot')(mongoose.models);
		} catch (err) {
			console.error(err);
		}
	}
});

// Try to connect
let url = process.env.NODE_IP ?
	process.env.OPENSHIFT_MONGODB_DB_URL :
	config.local_db_url;
mongoose.connect(url);