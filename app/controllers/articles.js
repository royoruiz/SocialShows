/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Article = mongoose.model('Article'),
    Socials = mongoose.model('Socials'),
    _ = require('underscore');


/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
    Article.load(id, function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};

/**
 * Create a article
 */
exports.create = function(req, res) {
    
    var article = new Article(req.body);
    
    article.reply = false;
    
    if (typeof req.body.show == "undefined") {article.show = false;}

    if (typeof req.body.assign != "undefined"){
        article.user = req.body.assign;
    }else{
        article.user = req.user;
    }
    article.creator = req.user;

    if (typeof req.body.conversation != "undefined"){
        article.conversation = req.body.conversation;
        article.reply = true;
    }else{
        article.conversation = mongoose.Types.ObjectId();
    }
    
    article.save(function(err) {
        if (err) {
            console.log(err);
            return res.send('users/signup', {
                errors: err.errors,
                article: article
            });
        } else {
            console.log(article);
            res.jsonp(article);
        }
    });
};

/**
 * Update a article
 */
exports.update = function(req, res) {
    var article = req.article;

    article = _.extend(article, req.body);

    article.save(function(err) {
        res.jsonp(article);
    });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
    res.jsonp(req.article);
};

exports.showall = function (req, res) {
    console.log("B1");
    Article.find({$and: [{'user': req.query.id}, {'reply': false}]}).sort('-created').populate('creator user', 'name username').exec(function(err, articles) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(articles);
        }
    });
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
    //console.log("A1");
/*
    Socials.find({'_id': req.user._id}).exec(function(err, socials){
        socials[0].friends.push(req.user._id);
        Article.find({'user': {$in: socials[0].friends}}).sort('-conversation created').populate('creator user', 'name username').exec(function(err, articles) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {

                res.jsonp(articles);
            }
        });

    });
*/
    Article.aggregate(
        {$group: {_id: {cnv:'$conversation', 'user': '$user', srt: '$_id'}}},
        {$sort: {'_id.srt': 1}},
        {$group: {_id: '$_id.cnv', 'user_init': {$first:'$_id.user'}}},
        {$match: {user_init: {$eq: req.user._id}}},
        {$project: {_id: 0, a: '$_id'}},
        function(err, result){
            //console.log(result);
            var res_aux = [];
            for (var i = result.length - 1; i >= 0; i--) {
                res_aux.push(result[i].a);
            };
            result = res_aux;
            //console.log(result);
            Socials.find({'_id': req.user._id}).exec(function(err, socials){
                socials[0].friends.push(req.user._id);
                Article.find({$or:[{'user': {$in: socials[0].friends}}, {'conversation': {$in: result}}]}).sort('-conversation created _id').populate('creator user', 'name username').exec(function(err, articles) {
                    if (err) {
                        res.render('error', {
                        status: 500
                        });
                    } else {
                        //console.log(articles);

                        res.jsonp(articles);
                    }
                });
            });            
        }

    );

/*
    Article.find().sort('-created').populate('user', 'name username').exec(function(err, articles) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(articles);
        }
    });
*/
};