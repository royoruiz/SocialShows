var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Socials = new Schema({
	friends: [
				Schema.ObjectId
			],
	watched: [
				{
					_id: Schema.ObjectId,
					showid: String, 
					epnum: [String],
					completed: Boolean
				}
			],
	skiped: [
				{
					_id: Schema.ObjectId,
					showid: String, 
					epnum: [String]
				}
			]
});

/**
 * Statics
 */
Socials.statics = {
    load: function(id, cb) {       
        this.findOne({
            _id: id
        }).exec(cb);
    }
};

mongoose.model('Socials', Socials);
