const express           = require('express');
const router            = express.Router();
const mongoose          = require('mongoose');
const passport          = require('passport');
const authDetails       = require('../../bot/config/auth.json');
const DiscordStrategy   = require('passport-discord').Strategy;
const scopes            = ['identify', 'guilds'];

passport.use(new DiscordStrategy({
		clientID: authDetails.clientID,
		clientSecret: authDetails.clientSecret,
		callbackURL: `${process.env.NODE_IP ? 'xxx/console/callback' : 'http://localhost:3000/console/callback'}`,
		scope: scopes
	}, (accessToken, refreshToken, profile, done) => {
		process.nextTick(() => done(null, profile));
	}
));


router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/auth', passport.authenticate('discord', {scope: scopes}), (req, res) => {
	res.write('Redirecting...');
});

router.get('/callback', passport.authenticate('discord', {failureRedirect: '/'}), (req, res) => {
	res.redirect('/console/guilds');
});

/* Server members pages */
router.get('/guild/:guildID/members', [checkAuth, guildExist], (req, res) => {
	let guild = req.app.locals.bot.guilds.get(req.params.guildID);
	let total = guild.members.keyArray().length,
		pageSize = 10,
		pageCount = Math.ceil(total / pageSize),
		currentPage = req.params.page == null ? 1 : req.params.page;

	// Set page if
	if (typeof req.query.page != 'undefined')
		currentPage =+ req.query.page;

	// Only get whats needed
	let begin = ((currentPage - 1) * pageSize),
		end   = begin + pageSize;
	let list = guild.members.keyArray().slice(begin, end);

	// Determine whether to disable buttons
	let disabled = {
		prev: currentPage == 1 ? 'disabled' : '',
		next: currentPage == pageCount ? 'disabled' : ''
	};

	// Return array of user objects
	let userList = [];
	list.forEach(memberID => {
		userList.push(req.app.locals.bot.users.get(memberID));
	});

	res.render(`guildMembers`, {
		title: 'Console',
		pageID: 'console',
		auth: req.isAuthenticated(),
		user: req.user,
		guild: guild,
		doc: req.guildDoc,
		users: userList,
		curPage: currentPage,
		disabledButtons: disabled
	});
});

/* server logs sub page */
router.get('/guild/:guildID/logs', [checkAuth, guildExist], (req, res) => {
	req.app.locals.db.logentries.find({guild_id: req.params.guildID}, (err, result) => {
		if (err) {
			res.status(404);
			res.render('error', {
				title  : 'Error 404',
				pageID: 'error',
				message: err
			});
		} else {
			let logs = result.map((log) => {
				return {
					action: log.action,
					staff: req.app.locals.bot.users.get(log.staff),
					user: req.app.locals.bot.users.get(log.user) || log.user,
					reason: log.reason,
					time: log.createdAt,
					id: log._id
				};
			});

			// todo: pagination
			let currentPage = 1;
			let disabled = {
				prev: 'disabled',
				next: 'disabled'
			};

			res.render(`discordLogs`, {
				title: 'Console',
				pageID: 'console',
				auth: req.isAuthenticated(),
				user: req.user,
				guild: req.app.locals.bot.guilds.get(req.params.guildID),
				doc: req.guildDoc,
				disabledButtons: disabled,
				curPage: currentPage,
				logs: logs
			});
		}
	});
});


/* Server home details */
router.get('/guild/:guildID', [checkAuth, guildExist], (req, res) => {
	res.redirect(`/console/guild/${req.params.guildID}/members`);
	/*
	res.render('guild', {
		title: 'Console',
		pageID: 'console',
		auth: req.isAuthenticated(),
		user: req.user,
		guild: req.app.locals.bot.guilds.get(req.params.guildID),
		doc: req.guildDoc
	});
	*/
});

/* List of user servers */
router.get('/guilds', checkAuth, (req, res) => {
	res.render('guilds', {
		title: 'Console',
		pageID: 'console',
		auth: req.isAuthenticated(),
		user: req.user
	});
});

/* If user logged in send to console if not send to login screen */
router.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect('/console/guilds');
	} else {
		res.redirect('/console/auth');
	}
});

/*
	Handlers
 */
// Check authorization, database, and bot
function checkAuth(req, res, next) {
	let dbState = mongoose.connection.readyState;
	let botStatus = req.app.locals.bot.status;

	if (req.isAuthenticated()) {
		if (dbState == 1 && botStatus == 0) {
			return next();
		} else {
			res.status(500);
			res.render('error', {
				title  : 'Error 500',
				pageID: 'error',
				message: 'Internal Server Error, Please Try again later'
			});
		}
	} else {
		res.status(401);
		res.render('error', {
			title  : 'Error 401',
			pageID: 'error',
			message: 'Unauthorized'
		});
	}
}

// Make sure bot is added in requested server / in database
function guildExist(req, res, next) {
	req.app.locals.db.guilds.findOne({_id: req.params.guildID}, (err, result) => {
		if (err || !result) {
			// This shouldn't happen but just in case
			res.status(404);
			res.render('error', {
				title  : 'Error 404',
				pageID: 'error',
				message: `This is embarrassing... The server doesn't exist in our database.`
			});
		} else {
			req.guildDoc = result;
			return next();
		}
	});
}

module.exports = router;
