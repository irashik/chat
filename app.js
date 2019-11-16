var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var log = require('./lib/log')(module);
var config = require('./config');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
const env = 'development';
var livereload = require('livereload');
var server = livereload.createServer();
var mongoose = require('./lib/mongoose');
var session = require('express-session');
var connectMongo = require ('connect-mongo');




var HttpError = require('./error').HttpError;

server.watch(__dirname + "/public");



const userRouter = require("./routes/userRouter");
const homeRouter = require("./routes/homeRouter");

var app = express();
//app.disable('view cache');


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
//app.use(expressLayouts); // конфликтует с ejs-mate


// view engine setup
app.engine('ejs', engine);   // ejs-mate 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/template'));



app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));
app.use(morgan('dev'));
app.use(cookieParser());

var MongoStore = connectMongo(session);

app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({ mongooseConnection: mongoose.connection })
    
}));

app.use(function(req, res, next) {
    req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
    res.send("Visits:" + req.session.numberOfVisits);
    
});


app.use(express.static(path.join(__dirname, '/public')));
app.use(require('./middleware/sendHttpError'));
app.use("/users", userRouter);
app.use('/', homeRouter);



// тестовая страница для шаблонизатора
app.get('/test', function(req, res, next) {
   
    log.debug("должна загрузиться страница ejs");
    res.render("testPage", { message: "Hello Dima" });
    log.debug("прошел ли метод рендера?"); 
});


app.use(function(err, req, res, next) {
    log.debug("получено управление next");
    
    if (typeof err == 'number') {
        err = new HttpError(err);
        log.debug("запущен httpError");
        
    }
    
    if (err instanceof HttpError) {
        res.sendHttpError(err);
        log.debug("запущен sendHttpError");
       
    } else {
        
           if (app.get('env') == 'development') {
               
               express.errorHandler()(err, req, res, next);
               
               } else {
               log.error(err);
               err = new HttpError(500);
               res.sendHttpError(err);
                
            }
        
        } 
        
    
});






if (app.get('env') == 'development') {
    
    app.use(morgan('dev'));
    
} else {
    
    app.use(morgan('default'));
    
};


 


//////////////////////
app.listen(config.get('port'));
log.info('Express server started on port ' + config.get('port'));




