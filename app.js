'use strict';

const express                       = require('express');
const engine                        = require('ejs-mate');
const path                          = require('path');
const log                           = require('./lib/log')(module);
const config                        = require('./config');
const bodyParser                    = require('body-parser');
const favicon                       = require('serve-favicon');
const logger                        = require('morgan');
const cookieParser                  = require('cookie-parser');
const routes                        = require('./routes/index');
const livereload                    = require('livereload');
const server                        = livereload.createServer();
const mongoose                      = require('./lib/mongoose');
const session                       = require('express-session');
const connectMongo                  = require ('connect-mongo');
const HttpError                     = require('./error').HttpError;
const passport                      = require('passport');
const LocalStrategy                 = require('passport-local').Strategy;
const flash                         = require('connect-flash');
const cors                          = require('cors');
const Account                       = require('./models/user');
const createError                   = require('http-errors');

let io = null;




const app = express();

const NODE_ENV = 'development';
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(logger('combined'));


server.watch(__dirname + "/public");

app.use(bodyParser.urlencoded({ 
    extended: false
}));

app.use(bodyParser.json());

// view engine setup
app.engine('ejs', engine);   // ejs-mate 
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/template'));
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));
app.use(cookieParser());

const sessionStore = require('./lib/sessionStore');



app.use(session({
    name: config.get('session:name'),
    secret: config.get('session:secret'),
    resave: config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    cookie: config.get('session:cookie'),
    store: sessionStore
    
}));




app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));

app.use(flash());

app.use(express.static(path.join(__dirname, '/public')));



// passport autorized
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy(function(username, password, done) {
    
    Account.findOne({ username: username }, function (err, account) {
                if (err) { 
                    log.debug('error' + err);
                    return done(err); 
                }
                if (!account) { 
                    log.debug('не сущ. такой аккаунт');
                    return done(null, false, { message: "User not found"});
                        
                } else {
                        
                        Account.verifyPassword(password, account.password, function(res) {
                            
                            if (res) {
                               return done(null, account, { message: "Hello " + account.username});
                             } else {
                                log.debug('Incorrect user || password');
                                return done(null, false, { message: "Incorrect user || password" }); 
                             }
                            
                        });
                                 
                }
                             
    });

}));



passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.use('/', routes);






// MY ERROR HANDLER

if(!isProduction) {

     
// обработка ошибок 404 - которые прошли через все обработчики.
app.use((req, res, next) => {
    return next(createError(404, "Ошибка 404"));
    
    res.json({
        message: req.message,
        message2: res.message
        
        
    });
    next();
    
});



// обработчики ошибок.2
app.use(function (err, req, res, next) {        // одного наверное достаточно.
      
        console.error(err.stack);
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
                error: err,
                error_status: err.status,
                stack: err.stack
                
            }
        });
    });


}








// ОБРАБОТЧИКИ ОШИБОК.

app.use(function(err, req, res, next) {
    log.debug("получено управление ОБРАБОТЧИК ОШИБОК");
    
    if (typeof err === 'number') {
        err = new HttpError(err);
        log.debug("запущен httpError");
        
    }
    
    if (err instanceof HttpError) {
        res.sendHttpError(err);
        log.debug("запущен sendHttpError");
       
    } else {
        
           if (app.get(NODE_ENV) === 'development') {
               log.debug("started errorHandler");
               express.errorHandler()(err, req, res, next);
               
               } else {
               log.error(err);
               err = new HttpError(500);
               res.sendHttpError(err);
                
            }
        
        } 
        
    
});






if (app.get(NODE_ENV) === 'development') {
    
    app.use(logger('dev'));
    
} else {
    
    app.use(logger('default'));
    
};


 


//////////////////////
let serverSock = app.listen(config.get('port'), () => {
              log.info('Server running on http://localhost on port ' + config.get('port'))
});


io = require('./socket')(serverSock);

app.set('io', io);
