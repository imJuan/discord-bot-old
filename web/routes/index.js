const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
	res.render('index', {
		title: 'Home',
		pageID: 'index',
		auth: req.isAuthenticated(),
		user: req.user
	});
});

module.exports = router;