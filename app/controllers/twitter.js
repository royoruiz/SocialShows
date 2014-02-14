/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Social = mongoose.model('Socials'),
    OAuth= require('oauth').OAuth,
    config = require('../../config/config'),
    oa;

/**
 * Auth callback
 */
exports.tweet = function(req, res, next) {

  var tcliid = '';
  var tclisec = '';
  var tclicb = '';

  if (req.user.provider == 'local'){
      tcliid = config.twitter_connect.clientID;
      tclisec = config.twitter_connect.clientSecret;
      tclicb = config.twitter_connect.callbackURL;
  }

  if (req.user.provider == 'twitter'){
      tcliid = config.twitter.clientID;
      tclisec = config.twitter.clientSecret;
      tclicb = config.twitter.callbackURL;  
  }

  oa = new OAuth(
   "https://api.twitter.com/oauth/request_token",
   "https://api.twitter.com/oauth/access_token",
   tcliid,
   tclisec,
   "1.0A",
   tclicb,
   "HMAC-SHA1"
  );

    oa.post(
    "https://api.twitter.com/1.1/statuses/update.json",
   req.user.token,
   req.user.tokenSecret,
   req.query, 
   function (error, data) {
    if(error) {
      console.log(error);
      res.end('bad stuff happened');
    } else {
      //console.log(data);
      res.end('go check your tweets!');
    }
  }
  );

    res.redirect('/');
};