/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Social = mongoose.model('Socials');

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);
    var social = new Social();

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            return res.render('users/signup', {
                errors: err.errors,
                user: user
            });
        }
        social._id = user._id;
        social.save(function(err) { if (err) return res.render('users/signup', {errors: err.errors, user: user});});
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
    var user = req.profile;

    res.render('users/show', {
        title: user.name,
        user: user
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

exports.findByUser = function(req, res){

    var array = req.query.q_friends.split(",");

    if (req.query.q_friends == ""){
        
        result = [];
        res.jsonp(result);
    }else{
        
        if (req.query.q_user == "undefined"){
            
            User.find({'_id': { $in: array }}).exec(function (err, result){
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
            User.find({'name': { $regex: req.query.q_user, $options: 'i' }}).exec(function (err, result){
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
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};