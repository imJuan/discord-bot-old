var express  = require('express');
var session  = require('express-session');
var passport = require('passport');

module.exports = (db, bot) => {
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((id, done) => {
		done(null, id);
	});

	var app = express();
	var env = process.env;

	app.set('port', env.NODE_PORT || 3000);
	app.set('views', 'web/views');
	app.set('view engine', 'ejs');

	app.use(session({secret: 'keyboard dog', resave: false, saveUninitialized: false}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static('web/public'));

	app.locals = {
		db: db,
		bot: bot
	};

	// Routes
	app.use(require('../web/routes/openshift'));
	app.use(require('../web/routes/index'));
	app.use('/console', require('../web/routes/console'));
	//app.use('/api', require('./web/routes/api'));
	app.use('*', (req, res) => {
		res.status(404);
		res.render('error', {
			title: 'Error 404',
			pageID: 'error',
			message: 'Page Not Found'
		});
	});

	// start hur up
	app.listen(app.get('port'), env.NODE_IP || 'localhost', () => {
		console.log('Listening on port ' + app.get('port'));
	});
};
