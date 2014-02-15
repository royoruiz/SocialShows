/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    TvShows = mongoose.model('TvShows');


/**
 * Find tvshow by id
 */
exports.tvshow = function(req, res, next, id) {
    TvShows.load(id, function(err, tvshow) {
        if (err) return next(err);
        if (!tvshow) return next(new Error('Failed to load tvshow ' + id));
        req.tvshow = tvshow;
        next();
    });
};

/**
 * Update a tvshow
 */
exports.update = function(req, res) {
    var tvshow = req.tvshow;

    tvshow.users.push(req.user);
    
    tvshow.save(function(err) {
        res.jsonp(tvshow);
    });
};


/**
 * Delete an tvshow
 */
exports.destroy = function(req, res) {
    var tvshow = req.tvshow;

    tvshow.users.pop(req.user);
    
    tvshow.save(function(err) {
        res.jsonp(tvshow);
    });
};

/**
 * Show an tvshow
 */
exports.show = function(req, res) {
    res.jsonp(req.tvshow);
};

/**
 * List of TvShows by airdate
 */
exports.findByAirdate = function(req, res) {
    //console.log(req.user);
    //var respons = TvShows.find({'Episodelist.episode.airdate' : {'$gte': req.query.ini, '$lt': req.query.fin}});
    //db.tvshows.aggregate({$unwind: '$Episodelist'}, {$project: {season: '$Episodelist.no', episode:'$Episodelist.episode'}}, {$unwind: '$episode'}, {$match: {'episode.airdate': {$gte: "2013-10-27", $lt: "2013-12-08"}}})

    //{title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    //console.log("entro");
    if (req.user){
        TvShows.aggregate(
        {$match: { 'Episodelist.episode': { '$exists': true } }},  
        {$unwind: '$Episodelist'}, 
        {$project: {_id: 0, airtime: '$airtime', season: '$Episodelist.no', elapsed: '$runtime', episode:'$Episodelist.episode', users: '$users'}}, 
        {$unwind: '$episode'}, 
        {$match: {'episode.airdate': {'$gte': req.query.ini, '$lt': req.query.fin}}},
        {$unwind: '$users'},
        {$match: {'users': req.user._id}},   
        function(err, result) {
            //console.log("hola");
            if (err) console.log("ERR : " + err);
            //else console.log("RES : " + JSON.stringify(result));

            var parrilla = JSON.stringify(result);
            var j = 0;
            var devolver = [];
            var aux = '';
            var date_start_aux = new Date();
            var date_end_aux = new Date();
            for (var i = result.length - 1; i >= 0; i--) {
                aux = result[i].season + 'x' + result[i].episode.seasonnum + ' - ' + result[i].episode.title;
                y = result[i].episode.airdate.substring(0,4);
                m = parseInt(result[i].episode.airdate.substring(5,7)) - 1;
                d = result[i].episode.airdate.substring(8,10);
                h = parseInt(result[i].airtime.substring(0,2));
                min = parseInt(result[i].airtime.substring(3,6));
                //console.log(y);
                //console.log(m);
                //console.log(d);
                //console.log(h);
                //console.log(h+1);
                //console.log(min);
                date_start_aux = new Date(y,m,d,h,min);
                //console.log(date_start_aux);
                //console.log(result[i].elapsed);
                dif = 0;
                dif_min = 0;
                if (result[i].elapsed == 60) {dif = 1; dif_min = 0;}
                if (result[i].elapsed == 30) {dif = 0; dif_min = 30;}
                if (result[i].elapsed == 120) {dif = 2; dif_min = 0;}
                date_end_aux = new Date(y,m,d,h + dif,min + dif_min);
                //console.log(date_end_aux);
                doc = {'title': aux, 'start': new Date(date_start_aux.valueOf() - date_start_aux.getTimezoneOffset() * (30000+30000)), 'end': new Date(date_end_aux.valueOf() - date_end_aux.getTimezoneOffset() * (30000+30000)), 'allDay': false};
                //console.log(doc);
                devolver[j] = doc;
                //console.log('hola 8');
                j++;
            }
            //console.log(devolver);
            res.jsonp(devolver);
            //console.log("ERR : " + err + " RES : " + JSON.stringify(result));
        });
    } else {
        TvShows.aggregate(
        {$match: { 'Episodelist.episode': { '$exists': true } }},    
        {$unwind: '$Episodelist'}, 
        {$project: {_id: 0, airtime: '$airtime', season: '$Episodelist.no', elapsed: '$runtime', episode:'$Episodelist.episode'}}, 
        {$unwind: '$episode'}, 
        {$match: {'episode.airdate': {'$gte': req.query.ini, '$lt': req.query.fin}}},   
        function(err, result) {
            if (err) console.log("ERR : " + err);
            //else console.log("RES : " + JSON.stringify(result));

            var parrilla = JSON.stringify(result);
            var j = 0;
            var devolver = [];
            var aux = '';
            var date_start_aux = new Date();
            var date_end_aux = new Date();
            for (var i = result.lenght - 1; i >= 0; i--) {
                aux = result[i].season + 'x' + result[i].episode.seasonnum + ' - ' + result[i].episode.title;
                y = result[i].episode.airdate.substring(0,4);
                m = parseInt(result[i].episode.airdate.substring(5,7)) - 1;
                d = result[i].episode.airdate.substring(8,10);
                h = parseInt(result[i].airtime.substring(0,2));
                min = parseInt(result[i].airtime.substring(3,6));
                //console.log(y);
                //console.log(m);
                //console.log(d);
                //console.log(h);
                //console.log(h+1);
                //console.log(min);
                date_start_aux = new Date(y,m,d,h,min);
                dif = 0;
                dif_min = 0;
                if (result[i].elapsed == 60) {dif = 1; dif_min = 0;}
                if (result[i].elapsed == 30) {dif = 0; dif_min = 30;}
                if (result[i].elapsed == 120) {dif = 2; dif_min = 0;}
                date_end_aux = new Date(y,m,d,h + dif,min + dif_min);
                doc = {'title': aux, 'start': new Date(date_start_aux.valueOf() - date_start_aux.getTimezoneOffset() * (30000+30000)), 'end': new Date(date_end_aux.valueOf() - date_end_aux.getTimezoneOffset() * (30000+30000)), 'allDay': false};
                //console.log(doc);
                devolver[j] = doc;
                //console.log('hola 8');
                j++;
            }
            //console.log(devolver);
            res.jsonp(devolver);
            //console.log("ERR : " + err + " RES : " + JSON.stringify(result));
        });
    }

};

/**
 * List of TvShows query by name
 */

exports.findByName = function(req, res){
    //console.log("3");
    //if (req.query.q_name == "undefined"){ console.log('y1');}
    //if (req.query.q_network == "undefined"){ console.log('y2');}
    //if (req.query.q_sorted == "undefined"){ console.log('y3');}
    //if (req.query.q_dir == "undefined"){console.log('y4');}
    //console.log(req.query.q_pat[1]);
    if (req.query.q_name === ''){ req.query.q_name = "undefined";}
    if (req.query.q_network === ''){ req.query.q_network = "undefined";}

    var dir = 0;
    if (req.query.q_dir == "desc") {
        dir = -1;

    } else {
        dir = 1;
    }    

    var sort_doc = {};
    sort_doc[req.query.q_sorted] = dir;

    if (req.query.q_name == "undefined") {
        if (req.query.q_network == "undefined"){
            // query base
            TvShows.aggregate(
                { $unwind: "$users" },
                { $group: { _id: {c_id:"$_id", showid: "$showid", name: "$name", network: "$network", Episodelist: "$Episodelist"}, users_temp: {$addToSet: '$users'}, count: { $sum: 1 }}},
                { $project: {_id : '$_id.c_id', showid: '$_id.showid', name: '$_id.name',network: '$_id.network', Episodelist: '$_id.Episodelist', users: '$users_temp', num: '$count'}},
                { $limit: 50},
                { $sort: {num: dir}}).exec(function(err, result){
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        res.render('error', {
                            status: 500
                        });
                    } else {
                        //console.log("ok_hoy");
                        //console.log('por defecto');
                        //console.log(JSON.stringify(result));
                        //console.log(result);
                        //res.jsonp(JSON.stringify(result));
                        res.jsonp(result);
                    } 
            });            

        } else {
            //name undefined and network ok
            //console.log("1");
            //console.log(sort_doc);
            //console.log(req.query.q_network);
            //var sort_doc2 = {};
            //sort_doc2['network.text']= dir;
            //console.log(sort_doc2);
            TvShows.find({ 'network.text': { $regex: req.query.q_network, $options: 'i' } }).sort(sort_doc).exec(function(err, result){
            //console.log("2");
            //console.log(err);
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    //console.log("3");
                    //console.log("ok_hoy");
                    res.jsonp(result);
                } 
            });            

        }
    } else {
        if (req.query.q_network == "undefined"){
            //name ok and network undefined
            TvShows.find({ 'name': { $regex: req.query.q_name, $options: 'i' } }).sort(sort_doc).exec(function(err, result){
            //console.log(result);
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    //console.log("normal");
                    //console.log(result);
                    res.jsonp(result);
                } 
            });

        } else {
            //name ok and network ok
            TvShows.find({ $and: [{'name': { $regex: req.query.q_name, $options: 'i' }}, {'network.text': { $regex: req.query.q_network, $options: 'i' }}] }).sort(sort_doc).exec(function(err, result){
            //console.log(result);
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    //console.log("ok_hoy");
                    res.jsonp(result);
                } 
            });

        }        
    }    
};

/**
 * List of TvShows
 */
exports.all = function(req, res) {
    //TvShows.find().sort('-created').populate('user', 'name username').exec(function(err, tvshows) {
    
    TvShows.find({}, {'showid': 1, 'name':1, 'network': 1, 'users':1}).sort('showid').limit(50).exec(function(err, tvshows) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            //console.log("ok");
            res.jsonp(tvshows);
        }
    });
};