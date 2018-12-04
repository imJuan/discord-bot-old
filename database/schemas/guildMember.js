const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
	_id: String,
	msg_amount: {type: Number, default: 0, min: 0},
	last_login: {type: Date, default: new Date()}
});
