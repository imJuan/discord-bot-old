module.exports = {
	member_add: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		message: {type: String, default: '@user Welcome!'}
	},
	member_remove: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		message: {type: String, default: '@user Bye!'}
	},
	member_online: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		message: {type: String, default: '@user is now online!'}
	},
	member_offline: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		message: {type: String, default: '@user is now offline.'}
	},
	message_deleted: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		channel_ids: [String]
	},
	message_edited: {
		enabled: {type: Boolean, default: false},
		channel_id: String,
		channel_ids: [String]
	}
};
