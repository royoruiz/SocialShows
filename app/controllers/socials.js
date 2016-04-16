/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Articles = mongoose.model('Article'),
    Social = mongoose.model('Socials'),
    _ = require('underscore');

/**
 * Find social links by id
 */
exports.social = function(req, res, next, id) {
    Social.load(id, function(err, social) {
        if (err) return next(err);
        if (!social) return next(new Error('Failed to load social ' + id));
        req.social = social;
        next();
    });
};

/**
 * Show an social
 */
exports.info = function(req, res) {
    res.jsonp(req.social);
};

/**
 * Update a social
 */
exports.update = function(req, res) {

    var social = req.social;
    social.skiped = req.body.skiped;
    social.watched = req.body.watched;
    social.friends = req.body.friends;

    social.save(function(err) {
        res.jsonp(social);
    });
};

/**
 * Api from iOS app to marck episode as watched
 */
exports.api_watch = function(req, res){
    var salida = {}
    //console.log(req.body)

    user_id = mongoose.Types.ObjectId(req.body.user);

    Social.findOne({'_id': user_id}).exec(function(err, social){

        show_id = req.body.show
        epinum_id = req.body.epnum
        name_id = req.body.name
        title_id = req.body.title
        season_id = req.body.season
        episode_id = req.body.episode
        console.log(epinum_id);

        var crtl = false;
        for (var i = social.watched.length - 1; i >= 0; i--) {

            if (social.watched[i].showid == show_id){
                console.log("aqui");
                //console.log(epinum_id);
                social.watched[i].epnum.push(epinum_id);
                crtl = true;
            }
        }

        if (!crtl) {
          console.log("aqui");
            social.watched.push({showid: show_id, epnum: [epinum_id], completed: false});
        }

        //console.log(social);
        //social.watched.push({showid: showid_in, epnum: epnum_in});
        //var tit = Global.user.username + ' check ' + season + 'x' + episode_in.seasonnum + ' - \"' + episode_in.title + '\" -';
        var tit = 'I\'ve  watched ' + name_id + ' - ' + season_id + 'x' + episode_id + ' - \"' + title_id + '\"';

        social.save(function(){
            var article = new Articles({
                    title: tit,
                    content: req.body.opinion,
                    show: true,
                    user: user_id,
                    creator: user_id,
                    reply: false,
                    conversation: mongoose.Types.ObjectId()
            });
            article.save(function(err){
                if (err){
                    salida['success'] = 0
                    res.jsonp(salida)
                }else{

                    salida['success'] = 1
                    res.jsonp(salida)
                }
            });
        });
        //console.log(tit);
    });






}

/**
 * Delete an social
 */
exports.destroy = function(req, res) {
    var social = req.social;

    social.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(social);
        }
    });
};
