var async = require('async');

module.exports = function(app, passport, auth) {
    app.all('/*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        next();
    });


    //User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/friends', users.findByUser);

    //Setting up the users api
    app.post('/users', users.create);

    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: 'Invalid email or password.'
    }), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    app.get('/connect/twitter', passport.authorize('twitter-auth', { failureRedirect: '/signin' })
    );                  

    app.get('/connect/twitter/callback', passport.authorize('twitter-auth', { 
        failureRedirect: '/signin' 
    }), users.authCallback);
  

    var twitter = require('../app/controllers/twitter');
    app.get('/twitter/tweet', auth.requiresLogin, twitter.tweet);    

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    //Article Routes
    var articles = require('../app/controllers/articles');
    app.get('/articles', articles.all);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/:articleId', articles.show);
    app.get('/wall', articles.all);
    app.get('/wall/:name', articles.showall);
    app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
    app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);

    //Finish with setting up the articleId param
    app.param('articleId', articles.article);

   //TvShows Routes
    var tvshows = require('../app/controllers/tvshows');
    app.get('/tvshows', tvshows.all);
    app.get('/tvshows/:tvshowsId', tvshows.show);
    app.put('/tvshows/:tvshowsId', auth.requiresLogin, tvshows.update);
    app.del('/tvshows/:tvshowsId', auth.requiresLogin, tvshows.destroy);
    app.get('/tvshowsbydate', tvshows.findByAirdate);
    app.get('/tvshowsbyname', tvshows.findByName);
    app.put('/tvshowsbyname/:tvshowsId', auth.requiresLogin, tvshows.update);
    app.del('/tvshowsbyname/:tvshowsId', auth.requiresLogin, tvshows.destroy);
    app.get('/list', tvshows.list);

    //Finish with setting up the tvshowsId param
    app.param('tvshowsId', tvshows.tvshow);
    app.param('month', tvshows.findByAirdate);

    //TvShows Routes
    var socials = require('../app/controllers/socials');  
    app.get('/socials/:userId', socials.info);
    app.put('/socials/:userId', auth.requiresLogin, socials.update);
    app.del('/socials/:userId', auth.requiresLogin, socials.destroy);
    //app.put('/socials/:userId', auth.requiresLogin, socials.friends);

    //Finish with setting up the userId param
    app.param('userId', socials.social);
     

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};