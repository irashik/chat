'use strict';

const express        = require('express');
const router         = express.Router();
const passport       = require('passport');
const mongoose       = require('mongoose');
const log            = require('../lib/log')(module);  //TODO: почему именно так???
const createError    = require('http-errors');
const Account        = require('../models/user');
const isLoggedIn     = require('../middleware/PassportAuth');



    
router.get('/', function(req, res) {
     res.render('frontpage', { 
                     user: req.user, 
                     message: req.flash('info') 
                     } );
});

router.get('/register', function(req, res) {
    log.debug('method register get');
    res.render('register', { message: req.flash('error')});
    req.flash('error', "неправильные данные");
    log.debug("method register load");
});


router.get('/login', function(req, res) {
    res.render('login', { user: req.body.username, message: req.flash('error') });
    
});


router.get('/chat',  isLoggedIn, function (req, res) {
      
         res.render('chat', { user: req.user } );
        
    });
   
  

router.get('/profile', isLoggedIn, function(req, res, next) {
       log.debug("router.post register is started");
       res.render('testAuth');

});


// post methods
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/chat'
}));

router.post('/register', function(req, res, next) {
    
    log.debug("router.post register is started");
   
    
    Account.setPassword(req.body.password, function(hash) {
             
        Account.register = new Account({ username: req.body.username, password: hash });  
          });
          
            log.debug('account register.save is started');
            Account.register.save(function (err) {
                if (err) {
                    //TODO: если аккаунт уже существует.
                    log.warn("account if exists ");
                    log.debug('account.register.save -- error');
                    return err;
                    next(err);
                } else {
                log.debug('account.register.save -- ok');
                req.logIn(Account.register, function(err) {
                
                if (err) {
                    next(err);
                } else {
                    /* чтобы сразу в чат, нужно тогда встроить проверку пользователя. */
                    
                      res.redirect ('/login');
                      log.debug("req LOgIn & redirect");
                }


                });
                     log.debug('register save ok2');
                }
           });
    
           
});



router.post('/logout', function(req, res, next) {
    
    log.debug('method post logout start');
    let sid = req.session.id;
    let io = req.app.get('io');
    req.flash('info', 'my flash-message - BAY! ');
        
    req.session.destroy(function(err) {
        io.sockets.emit("session:reload", sid); // is not a function $emit
         
        if (err) return next(err);
        else {
        req.logout();
        res.redirect('/');       
    }
        
    }); 

   
    
    
});




///////// testing
       
//// testing    
router.get('/testing', (req, res) => {
        //throw new Error('Something broke!');
        throw createError(400, 'Something broke');
});

router.get('/testing2', async (req, res, next) => {
        return next(new Error('Something broke!'));
});


router.get('/test', async (req, res, next) => {
      res.send(req.sessionID + 
            "<br>" + req.session.cookie.expires +
            "<br>" + req.session.cookie.maxAge + 
            "<br>" + req.user + 
            "<br>" + req.user.username);
});
    
    
router.get('/testAuth', function (req, res) {
    log.warn('req.user' + req.user);
    log.warn('req.session ' + req.session);
    log.info('user ' + req.user);
        
    res.render('testAuth', {
        user: req.user
    });
});
    
    
    
module.exports = router;


