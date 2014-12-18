/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
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
 * Session
 */
exports.api_login = function(req, res) {
    //console.log(req);
    var api_login = {};
    
    User.findOne({email: req.query.email}).exec(function(err, user){
        if (err){
            api_login['success'] = 0;
            api_login['error_message'] = err.message;
        }else{
            if (!user) {
                //console.log("hola1");
                api_login['success'] = 0;
                api_login['error_message'] = "User not registered. Please, sign up first.";
                return res.jsonp(api_login);
            }else{
                if (!user.authenticate(req.query.password)){
                    api_login['success'] = 0;
                    api_login['error_message'] = "Password is invalid/incorrect.";
                    return res.jsonp(api_login);                   
                }else{
                        //var api_login = {};
                    api_login['_id'] = user['_id'];
                    api_login['provider'] = user['provider'];
                    api_login['name'] = user['name'];
                    api_login['email'] = user['email'];
                    api_login['username'] = user['username'];
                    api_login['hashed_password'] = user['hashed_password'];
                    api_login['salt'] = user['salt'];
                    api_login['__v'] = user['__v'];
    
                    api_login['id'] = user['_id'];
    
                    api_login['success'] = 1;

                    return res.jsonp(api_login || null);
                }            
            }
        }
    });
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
        }else{
            social._id = user._id;
            social.save(function(err) { if (err) return res.render('users/signup', {errors: err.errors, user: user});});
            req.logIn(user, function(err) {
                if (err) return next(err);
                return res.redirect('/');
            });
        }

    });
};


exports.api_create = function(req, res) {
    //console.log(req.body);
    
    var user = new User(req.body);
    var social = new Social();
    var message = "";
    
    user.provider = 'local';
    
    user.save(function(err) {
        //console.log(err);
        if (err) {
            
            //console.log(err.code);
            
            switch(err.code){
                case 11000:
                    message = "User ya existente";
                    break;
                default:
                    message = "Error al dar de alta el usuario";
            }
            return res.jsonp({'success': 0, 'error_message': message});
        }else{
            social._id = user._id;
            social.save(function(err) { 
                if (err) {
                    message = "Error al salvar la parte social";
                    return res.jsonp({'success': 0, 'error_message': message});
                }
            });
            req.logIn(user, function(err) {
            if (err) return next(err);
                return res.jsonp({'success': 1, 'id': user._id});
            });        
        }

    });
};

/**
 *  Verify user from app twitter connect profile
 */
exports.api_twitter = function(req, res){
    //console.log(req.body['id']);
    //console.log(req.body);
    var id = req.query.id;
    
    var query = {};
    query['twitter.id_str'] = id.replace(/"/g,'');
    
    //console.log(query);
    /*
    User.findOne({'twitter.id_str': req.body.id}).exec(function (err, result){
        if (err) return next(err);
        //var salr = user;
        console.log(err);
        console.log(result);
        return res.jsonp(result);
    });
    */
        User.find(query, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    
                    console.log("no user");
                    
                } else {
                    //console.log(user);
                    var resp_success = {};
                    
                    //resp_success = user[0];
                    //console.log(user);
                    if (user.length > 0){
                        resp_success['success'] = 1;
                        resp_success['id'] = user[0]['_id'];
                    }else{
                        resp_success['success'] = 0;
                        resp_success['error_message'] = "User not registered. Please, sign up first.";
                    }
                    //console.log(resp_success);
                    return res.jsonp(resp_success);
                }
            });
    
};


/**
 *  Verify user from app twitter connect profile
 */
exports.api_twitter_new = function(req, res){
    //console.log(req.body['id']);
    //console.log(req.body);
    var id = req.body.id;
    var name = req.body.name;
    var scn = req.body.screen;
    var img = req.body.img;
    var message = ""
    
    var resp_success = {};
    
    //var query = {};
    //console.log(profile);
    //var text = profile.replace(/\n/g,'');
    
    //console.log(text);
    
    //profile_good = JSON.parse(text);
    
    //console.log(typeof(profile));
    
    //console.log(profile);
    
    //profile_good = JSON.parse(profile);
    
    //console.log(profile_good);
    
    user = new User({
        name: name.replace(/"/g,''),
        username: scn.replace(/"/g,''),
        provider: 'twitter',
        token : "",
        tokenSecret : "",
        twitter: {
            profile_image_url: img.replace(/"/g,''),
            id_str: id.replace(/"/g,'')
        }
    });
    
    user.save(function(err) {
        if (err) {
            switch(err.code){
                case 11000:
                    message = "User ya existente";
                    break;
                default:
                    message = "Error al dar de alta el usuario";
            }
            return res.jsonp({'success': 0, 'error_message': message});
        } else{
            var social = new Social();
            social._id = user._id;
            social.save(function(err){ 
                if (err) {
                    message = "Error al salvar la parte social";
                    return res.jsonp({'success': 0, 'error_message': message});
                }else{
                    resp_success['success'] = 1;
                    resp_success['id'] = user['_id'];
                    return res.jsonp(resp_success);
                }
            //return done(err, social);
            });
        //return done(err, user);       
        }

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