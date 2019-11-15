const express = require("express");
const homeRouter = express.Router();

var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var ObjectID = require('mongodb').ObjectID;


homeRouter.get("/about", function(req, res, next) {
    res.send("</h1>Hello it's About</h1>");
    
    
});

 homeRouter.get("/", function(req, res, next) {
    
       
    res.render('index'); 
    
    
    
        
    });
    
    
    module.exports = homeRouter;