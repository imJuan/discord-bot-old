var express      = require('express');
var router       = express.Router();
var contentTypes = require('../public/js/content-types');
var sysInfo      = require('../public/js/sys-info');

router.get('/health', function (req, res) {
	res.writeHead(200);
	res.end();
});

router.get('/info/gen', function (req, res) {
	let url = req.url;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store');
	res.end(JSON.stringify(sysInfo[url.slice(6)]()));
});

router.get('/info/poll', function (req, res) {
	let url = req.url;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store');
	res.end(JSON.stringify(sysInfo[url.slice(6)]()));
});


module.exports = router;