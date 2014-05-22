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
    tvshow.followers = tvshow.users.length;
    
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
    tvshow.followers = tvshow.users.length;
    
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

    if (req.user){        

        TvShows.aggregate(

        { $match: {$and: [{ 'Episodelist.episode': { '$exists': true } }, {'Episodelist.episode.airdate': {'$gte': req.query.ini, '$lt': req.query.fin}}, {'users': req.user._id}]}}, 
        {$unwind: '$Episodelist'}, 
        {$project: {_id: 0, show_id: '$_id', show: '$showid',airtime: '$airtime', season: '$Episodelist.no', elapsed: '$runtime', episode:'$Episodelist.episode', users: '$users', name: '$name'}}, 
        {$unwind: '$episode'}, 
        {$match: {'episode.airdate': {'$gte': req.query.ini, '$lt': req.query.fin}}},
        {$unwind: '$users'},
        {$match: {'users': req.user._id}},   
        function(err, result) {

            if (err) console.log("ERR : " + err);


            var parrilla = JSON.stringify(result);
            var j = 0;
            var devolver = [];
            var aux = '';
            var date_start_aux = new Date();
            var date_end_aux = new Date();
            for (var i = result.length - 1; i >= 0; i--) {
                //console.log(result[i]);

                aux = result[i].name + ' - ' + result[i].season + 'x' + result[i].episode.seasonnum;
                //aux_lnk = "<a data-ng-href=\"#!/tvshows/" + result[i].show_id + "/" + result[i].season + "/"+ result[i].episode.title +"\">" + aux + "</a>";
                aux_lnk = "#!/tvshows/" + result[i].show_id + "/" + result[i].season + "/"+ result[i].episode.title;
                y = result[i].episode.airdate.substring(0,4);
                m = parseInt(result[i].episode.airdate.substring(5,7)) - 1;
                d = result[i].episode.airdate.substring(8,10);
                h = parseInt(result[i].airtime.substring(0,2));
                min = parseInt(result[i].airtime.substring(3,6));

                date_start_aux = new Date(y,m,d,h,min);

                dif = 0;
                dif_min = 0;
                if (result[i].elapsed == 60) {dif = 1; dif_min = 0;}
                if (result[i].elapsed == 30) {dif = 0; dif_min = 30;}
                if (result[i].elapsed == 120) {dif = 2; dif_min = 0;}
                date_end_aux = new Date(y,m,d,h + dif,min + dif_min);

                doc = {'title': aux, 'start': new Date(date_start_aux.valueOf() - date_start_aux.getTimezoneOffset() * (30000+30000)), 'end': new Date(date_end_aux.valueOf() - date_end_aux.getTimezoneOffset() * (30000+30000)), 'allDay': false, 'url': aux_lnk, 'dat1': result[i].show, 'dat2': result[i].episode.epnum};

                devolver[j] = doc;

                j++;
            }

            res.jsonp(devolver);

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

                date_start_aux = new Date(y,m,d,h,min);
                dif = 0;
                dif_min = 0;
                if (result[i].elapsed == 60) {dif = 1; dif_min = 0;}
                if (result[i].elapsed == 30) {dif = 0; dif_min = 30;}
                if (result[i].elapsed == 120) {dif = 2; dif_min = 0;}
                date_end_aux = new Date(y,m,d,h + dif,min + dif_min);
                doc = {'title': aux, 'start': new Date(date_start_aux.valueOf() - date_start_aux.getTimezoneOffset() * (30000+30000)), 'end': new Date(date_end_aux.valueOf() - date_end_aux.getTimezoneOffset() * (30000+30000)), 'allDay': false};

                devolver[j] = doc;

                j++;
            }

            res.jsonp(devolver);

        });
    }

};

/**
 * List of TvShows query by name
 */

exports.findByName = function(req, res){

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
            if (req.query.q_just == "true"){
                TvShows.aggregate(
                    { $match: {'users': req.user._id}},                    
                    { $unwind: "$users" },
                    { $group: { _id: {c_id:"$_id", showid: "$showid", name: "$name", network: "$network", Episodelist: "$Episodelist"}, users_temp: {$addToSet: '$users'}, count: { $sum: 1 }}},
                    { $project: {_id : '$_id.c_id', showid: '$_id.showid', name: '$_id.name',network: '$_id.network', Episodelist: '$_id.Episodelist', users: '$users_temp', num: '$count'}},
                    { $sort: {num: dir}}).exec(function(err, result){
                        //console.log(result);
                        if (err) {
                            console.log(err);
                            res.render('error', {
                                status: 500
                            });
                        } else {

                            res.jsonp(result);
                        } 
                });
            }else{

                TvShows.find(
                    { 'followers': {$gt: 0} }).sort({'followers': dir}).limit(50).exec(function(err, result){

                        if (err) {
                            console.log(err);
                            res.render('error', {
                                status: 500
                            });
                        } else {
                            res.jsonp(result);
                        } 
                });                
            }           

        } else {
            TvShows.find({ 'network.text': { $regex: req.query.q_network, $options: 'i' } }).sort(sort_doc).exec(function(err, result){
                //console.log("2");
                //console.log(err);
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(result);
                } 
            });            

        }
    } else {
        if (req.query.q_network == "undefined"){
            //name ok and network undefined
            TvShows.find({ 'name': { $regex: req.query.q_name, $options: 'i' } }).sort(sort_doc).exec(function(err, result){
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(result);
                } 
            });

        } else {
            //name ok and network osk
            TvShows.find({ $and: [{'name': { $regex: req.query.q_name, $options: 'i' }}, {'network.text': { $regex: req.query.q_network, $options: 'i' }}] }).sort(sort_doc).exec(function(err, result){
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(result);
                } 
            });

        }        
    }    
};

/** 
 * List of shows with pending episodes for a users
 *
 */
exports.list = function(req, res){
    TvShows.aggregate(
        { $match: {'users': req.user._id}},                    
        { $unwind: "$users" },
        { $group: { _id: {c_id:"$_id", showid: "$showid", name: "$name", network: "$network", Episodelist: "$Episodelist"}, users_temp: {$addToSet: '$users'}, count: { $sum: 1 }}},
        { $project: {_id : '$_id.c_id', showid: '$_id.showid', name: '$_id.name',network: '$_id.network', Episodelist: '$_id.Episodelist', users: '$users_temp', num: '$count'}}
        ).exec(function(err, result){
            if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                res.jsonp(result);
            } 
    });
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