const mongoose = require('mongoose');

var schema = new mongoose.Schema({
	guild_id: {type: String, required: true, ref: 'Guilds'},
	action: {type: String, required: true, enum: ['Ban', 'Unban', 'Kick', 'Warn']},
	createdAt: {type: Date, expires: '20d'},
	user: {type: String, required: true},
	staff: {type: String, required: true},
	reason: {type: String, required: true, minlength: 2, maxlength: 100},
});

module.exports = schema;
