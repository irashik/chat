//var User = require('../models/user').User;
//var HttpError = require('../error').HttpError;
//var AuthError = require('../models/user').AuthError;
//var async = require('async');
//var log = require('../lib/log')(module);
//
//
//
//exports.get = function(req, res) {
//    
//    res.render('login');
//};
//
//exports.post = function(req, res, next) {
//    
//    log.debug("сработал метод пост");
//    
//    var username = req.body.username;
//    var password = req.body.password;
//    
//    log.info(username);
//    log.info(password);
//    
//    User.authorize(username, password, function(err, user) {
//        if(err) {
//            if (err instanceof AuthError) {
//                return next (new HttpError(403, err.message));
//            } else {
//                return next(err);
//            }
//        }
//        
//        req.session.user = user._id;
//        
//        //req.send({}); // здесь выбрасывает исключение.
//        
//    });
//};
//
