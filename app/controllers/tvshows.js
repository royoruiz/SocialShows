/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Social = mongoose.model('Socials'),
    TvShows = mongoose.model('TvShows');

var total = 0;
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
        { $group: { _id: {c_id:"$_id", showid: "$showid", name: "$name", network: "$network", Episodelist: "$Episodelist", status: "$status"}, users_temp: {$addToSet: '$users'}, count: { $sum: 1 }}},
        { $project: {_id : '$_id.c_id', showid: '$_id.showid', name: '$_id.name',network: '$_id.network', Episodelist: '$_id.Episodelist', status:'$_id.status', users: '$users_temp', num: '$count'}}
        ).exec(function(err, result){
            if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                //console.log(result);
                res.jsonp(result);
            }
    });
};


/**
 * Api service Calendar of Shows
 *
 */
exports.api_calendar = function(req, res){

    var_id = mongoose.Types.ObjectId(req.query.id);

    var ini = req.query.date_ini
    var fin = req.query.date_fin

    //console.log(req.body)

    TvShows.aggregate(
        //{ $match: {$and: [{ 'Episodelist.episode': { '$exists': true } }, {'Episodelist.episode.airdate': {'$gte': req.query.ini, '$lt': req.query.fin}}, {'users': req.user._id}]}},
        { $match: {$and: [{ 'Episodelist.episode': { '$exists': true } }, {'Episodelist.episode.airdate': {'$gte': ini, '$lte': fin}}, {'users': var_id}]}},
        {$unwind: '$Episodelist'},
        {$project: {_id: 0, show_id: '$_id', show: '$showid',airtime: '$airtime', season: '$Episodelist.no', elapsed: '$runtime', episode:'$Episodelist.episode', users: '$users', name: '$name'}},
        {$unwind: '$episode'},
        {$match: {'episode.airdate': {'$gte': ini, '$lte': fin}}},
        {$unwind: '$users'},
        {$match: {'users': var_id}},
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

                doc = {'name': result[i].name, 'title': result[i].episode.title, 'epi':result[i].episode.seasonnum,'season': result[i].season, 'start': new Date(date_start_aux.valueOf() - date_start_aux.getTimezoneOffset() * (30000+30000)), 'end': new Date(date_end_aux.valueOf() - date_end_aux.getTimezoneOffset() * (30000+30000)), 'allDay': false, 'url': aux_lnk, 'dat1': result[i].show, 'dat2': result[i].episode.epnum};

                devolver[j] = doc;

                j++;
            }

            Social.findOne({'_id': var_id}).exec(function(err, social){
            //console.log(devolver);
                    var list_aux=[];
                    var remove = false;
                    for (var l = devolver.length - 1; l >= 0; l--) {
                        //console.log(l);
                        remove = false;
                        for (var w = social.watched.length - 1; w >= 0; w--) {
                            //console.log(w);
                                //console.log(devolver[l].dat1);
                                //console.log(social.watched[w].showid);
                            if (social.watched[w].showid == devolver[l].dat1){

                                for (var e = social.watched[w].epnum.length - 1; e >= 0; e--) {
                                    if (social.watched[w].epnum[e] == devolver[l].dat2){
                                        //console.log("remove");
                                        remove = true;
                                    }
                                }
                            }
                        }
                        if (!remove){list_aux.push(devolver[l]);}
                    }
                    //console.log(list_aux);
                    devolver = [];
                    devolver = list_aux;
                    res.jsonp(devolver);
            });


        });
};


/**
 * Api service List of shows with pending episodes for a users
 *
 */
exports.api_list = function(req, res){
    //console.log(req);

    var_id = mongoose.Types.ObjectId(req.query.id);

    TvShows.aggregate(
        { $match: {'users': var_id}},
        { $unwind: "$users" },
        { $group: { _id: {c_id:"$_id", showid: "$showid", name: "$name", network: "$network", Episodelist: "$Episodelist", status: "$status"}, users_temp: {$addToSet: '$users'}, count: { $sum: 1 }}},
        { $project: {_id : '$_id.c_id', showid: '$_id.showid', name: '$_id.name',network: '$_id.network', Episodelist: '$_id.Episodelist', status:'$_id.status', users: '$users_temp', num: '$count'}}
        ).exec(function(err, result){
            if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                Social.findOne({'_id': var_id}).exec(function(err, social){
                    salida = reord_shows(var_id, result, social);
                    //console.log("A");
                    //console.log(salida);
                    res.jsonp(salida);
                });

            }
    });
};

function reord_shows(id, shows, social){

            var show = {};
            var shows_temp = [];
            var shows_ended = [];
            var shows_returning = [];
            var sum = 0;
            var d = new Date();
            var d2 = new Date();
            var varclass = "";
            for (var i = shows.length - 1; i >= 0; i--) {
                s_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].no;
                e_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].seasonnum;
                t_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].title;
                en_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].epnum;
                date_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].airdate;
                sum = 0;
                for (var j = shows[i].Episodelist.length - 1; j >= 0; j--) {

                    var k = shows[i].Episodelist[j].episode.length - 1;
                    sum = sum + k + 1;
                    var aux = false;
                    var aux_skip =false;

                    for (var k = shows[i].Episodelist[j].episode.length - 1; k >= 0; k--) {

                        aux = iswatched(shows[i].showid, shows[i].Episodelist[j].episode[k].epnum, social.watched);
                        aux_skip = isskiped(shows[i].showid, shows[i].Episodelist[j].episode[k].epnum, social.skiped);
                        if (!aux_skip){

                            if (!aux && parseInt(shows[i].Episodelist[j].episode[k].epnum) < parseInt(en_prev)){

                                s_prev = shows[i].Episodelist[j].no;
                                e_prev = shows[i].Episodelist[j].episode[k].seasonnum;
                                t_prev = shows[i].Episodelist[j].episode[k].title;
                                en_prev = shows[i].Episodelist[j].episode[k].epnum;
                                date_prev = shows[i].Episodelist[j].episode[k].airdate;

                            }
                        }

                    };

                };

                if (total == sum) {
                    switch(shows[i].status){
                        case "Ended":
                        case "Canceled":
                        case "Never Aired":
                        case "Pilot Rejected":
                        case "Canceled/Ended":
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-ended'};
                            shows_ended.push(show);
                            break;
                        case "Returning Series":
                        case "On Hiatus":
                        case "Final Season":
                        case "TBD/On The Bubble":
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-no-more'};
                            shows_returning.push(show);
                            break;
                        default:
                            d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                            if (d2 > d){
                                varclass = 'show-list-future';

                            }else{
                                varclass = 'show-list-past';
                            }
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true , 'class': varclass};
                            shows_temp.push(show);
                            break;
                    }


                }else{
                    d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                    if (d2 > d){
                        varclass = 'show-list-future';

                    }else{
                        varclass = 'show-list-past';
                    }
                    show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true, 'class': varclass}
                    shows_temp.push(show);
                }

            };

            var comp = {};
            for (var i = 0; i < shows_temp.length - 1; i++) {
                for (var j = 0; j < shows_temp.length - 1; j++){
                    if (shows_temp[j].airdate > shows_temp[j+1].airdate){
                        comp = shows_temp[j];
                        shows_temp[j] = shows_temp[j+1];
                        shows_temp[j+1] = comp;

                    }
                }

            };

            for (var i = 0; i < shows_ended.length - 1; i++) {
                for (var j = 0; j < shows_ended.length - 1; j++){
                    if (shows_ended[j].airdate > shows_ended[j+1].airdate){
                        comp = shows_ended[j];
                        shows_ended[j] = shows_ended[j+1];
                        shows_ended[j+1] = comp;

                    }
                }

            };

            for (var i = 0; i < shows_returning.length - 1; i++) {
                for (var j = 0; j < shows_returning.length - 1; j++){
                    if (shows_returning[j].airdate > shows_returning[j+1].airdate){
                        comp = shows_returning[j];
                        shows_returning[j] = shows_returning[j+1];
                        shows_returning[j+1] = comp;

                    }
                }

            };

            for (var i = 0; i < shows_returning.length; i++) {
                shows_temp.push(shows_returning[i]);
            };

            for (var i = 0; i < shows_ended.length; i++) {
                shows_temp.push(shows_ended[i]);
            };
        //console.log(shows_temp);
        return shows_temp;

};

function iswatched(showid_in, epnum_in, watched) {
        var responsw = false;
        for (var i = watched.length - 1; i >= 0; i--) {

            if (watched[i].showid == showid_in){
                total = watched[i].epnum.length;
                for (var j = watched[i].epnum.length - 1; j >= 0; j--) {
                    if (watched[i].epnum[j] == epnum_in){
                        responsw = true;
                    }

                }

            }

        }
        return responsw;

    };

function isskiped(showid_in, epnum_in, array) {
        var responsw = false;
        var vector_skip = array;

        //console.log(vector_skip);
        for (var i = vector_skip.length - 1; i >= 0; i--) {

            if (vector_skip[i].showid == showid_in){
                total += vector_skip[i].epnum.length;
                for (var j = vector_skip[i].epnum.length - 1; j >= 0; j--) {
                    if (vector_skip[i].epnum[j] == epnum_in){
                        responsw = true;
                    }

                }

            }

        }
        return responsw;

    };

/**
 * Api find TvShows query by name
 */

exports.api_find = function(req, res){

    var q_dir = -1
    var q_name = req.query.q_name

    //console.log(req.body);

    var sort_doc = {};
    sort_doc['populate'] = q_dir;

    if (q_name == "undefined") {
        TvShows.find(
            { 'followers': {$gte: 0} }).sort({'followers': q_dir}).limit(50).exec(function(err, result){

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
        //name ok and network undefined
        TvShows.find({ 'name': { $regex: q_name, $options: 'i' } }).sort(sort_doc).exec(function(err, result){
            if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                //console.log(result);
                res.jsonp(result);
            }
        });
    }
};

/**
 * Api for follow and check episodes
 */
exports.api_followandcheck = function(req, res){
    //console.log(req);
    var var_id = mongoose.Types.ObjectId(req.body.user);
    var comp = false;

    if (req.body.complete == 'true') { comp = true;}

    //console.log(req.body);

    TvShows.findOne({'showid': req.body.show}).exec(function(err, show){
        var crtl = false;
        var temp = [];
        var z=0;
        var ind = 0;
        if (req.body.clave){
            for (var j2 = show.Episodelist.length - 1; j2 >= 0; j2--) {
                for (var k2 = show.Episodelist[j2].episode.length - 1; k2 >= 0; k2--) {
                    if (parseInt(req.body.clave)>=parseInt(show.Episodelist[j2].episode[k2].epnum)) {
                        temp[z] = show.Episodelist[j2].episode[k2].epnum;
                        z++;
                    }
                }
            }

        }else{
            if (comp){
                for (var j3 = show.Episodelist.length - 1; j3 >= 0; j3--) {
                    for (var k3 = show.Episodelist[j3].episode.length - 1; k3 >= 0; k3--) {
                        temp[z] = show.Episodelist[j3].episode[k3].epnum;
                        z++;
                    }
                }
            }
        }
        Social.findOne({'_id': var_id}).exec(function(err,social){
            var salida = {};
            salida['success'] = 1
            //console.log(show);
            //console.log(social);
            //console.log(temp);

            for (var i = social.watched.length - 1; i >= 0; i--) {
                if (social.watched[i].showid == show.showid) {
                    crtl = true;
                    ind = i;

                }
            }

            if (crtl){
                social.watched[ind].epnum = temp;
                if (comp){
                    social.watched[ind].completed = true;
                }else{
                    social.watched[ind].completed = false;
                }

            } else {
                if (comp){
                    social.watched.push({showid: show.showid, epnum: temp, completed: true});
                }else{
                    social.watched.push({showid: show.showid, epnum: temp, completed: false});
                }

            }



            show.users.push(var_id);
            show.followers = show.users.length;

            show.save(function(err) {
               if (err){ salida['success'] = 0; salida['error_message'] = "Error save show";}
            });

            if (salida['success'] == 1){
                social.save(function(err){
                    if (err){ salida['success'] = 0; salida['error_message'] = "Error save social";}
                });
            }



            res.jsonp(salida)

        });
    });

};

/**
 * Unfollow tv shows
 */
exports.api_unfollow = function(req, res){
    console.log(req.body);

    var var_id = mongoose.Types.ObjectId(req.body.user);
    var salida = {};

    TvShows.findOne({'showid': req.body.show}).exec(function(err, show){
        show.users.pop(var_id);
        show.followers = show.users.length;

        show.save(function(err) {
            salida['success'] = 1;
            res.jsonp(salida);
        });
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
