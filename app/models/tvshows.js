var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TvShows = new Schema({
	name			: { type: String , index: true },
	totalseasons	: { type: String },	
	showid			: { type: String , index: { unique: true }},	 
	showlink		: { type: String },	
	started			: { type: String },	
	ended			: { type: String },	
	image			: { type: String },	
	origin_country	: { type: String },	
	status			: { type: String },	
	classification	: { type: String },	
	genres			: { type: String },
	runtime			: { type: String },	
	network			: {	country: String, text: {type: String, index: true}}, 
	airtime			: { type: String },	
	airday			: { type: String },	
	timezone		: { type: String },	
	akas			: { type: String },
	Episodelist		: [
						{ 
							no			: { type: String },
							episode		: [
									{	epnum		: { type: String },
										seasonnum	: { type: String },
										prodnum		: { type: String },
										airdate		: { type: String },
										link		: { type: String },
										title		: { type: String },	
										screencap	: { type: String }
									}]
						} 
					],					
	users			: [{type: Schema.ObjectId, ref: 'User', unique: true}]

});

/**
 * Statics
 */
TvShows.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user', 'name username').exec(cb);
    }
};

mongoose.model('TvShows', TvShows);