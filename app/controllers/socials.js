/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
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
    
    //social.watched.push(req.body.watched[req.body.watched.length-1]);
    social.watched = req.body.watched;

    social.save(function(err) {
        res.jsonp(social);
    });
};

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