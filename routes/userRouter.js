const express = require ("express");
const userRouter = express.Router();
var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var ObjectID = require('mongodb').ObjectID;

    
userRouter.get('/', function(req, res, next) {
        
               
        User.find({}, function(err, users) {
            if (err) return next(err);
            res.json(users);
        });
    });
    
    
userRouter.get('/:id', function(req, res, next) {
        
    try {
            var id = new ObjectID(req.params.id);
        } catch (e) {
            return next(404);
            
        }
       
        
        User.findById(id, function(err, user) { 
            if (err) return next(err);
            if (!user) {
               return next(404);
            }
            res.json(user);
        });
    });



module.exports = userRouter;