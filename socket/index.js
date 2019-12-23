const log                           = require('../lib/log')(module);
const config                        = require('../config');
const connect                       = require('connect');
const async                         = require('async');
const cookie                        = require('cookie');
const sessionStore                  = require('../lib/sessionStore');
const HttpError                     = require('../error').HttpError;
const User                          = require('../models/user');
const cookieParser                  = require('cookie-parser');


function loadSession(sid, callback) {
    log.debug("function loadSession is start");
    
    sessionStore.load(sid, function(err, session) {
        if (arguments.length === 0) {
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}
 
 
   

function loadUser(session, callback) {
    
    log.debug("loadUser start | session = " + JSON.stringify(session));
    log.debug("session.passport.user= " + session.passport.user);
    
    
    if (!session.passport.user) {
        log.debug("Session %s is anonymous", session.passport.user);
        return callback(null, null);
    }
    
    log.debug("retrieving user: " + session.passport.user);
        
    let user = session.passport.user;
    callback(null, user);
        
    
 }





module.exports = function(serverSock) {

const io = require('socket.io').listen(serverSock);
io.set('origins', config.get('url') + ":" + config.get('port'));
//TODO: io.set('logger', log); // is not valid logger
log.debug('socket server is start');


io.set('authorization', function(handshake, callback) {
    
    log.debug("socket authorization start is");
       

    async.waterfall([
        
        
        function(callback) {
            handshake.cookies = cookie.parse(handshake.headers.cookie || '');
            let sidCookie = handshake.cookies[config.get('session:name')];
            let sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
            log.debug("sid user= " + sid);
            loadSession(sid, callback);  // загружает сессию
            
        },
        
        function(session, callback) {
            
            if(!session) {
                log.debug("no session");
                callback(new HttpError(401, "No session"));
            }
            
            handshake.session = session;
            
            loadUser(session, callback);
            
        },
        
        function(user, callback) {
            if (!user) {
                log.debug("no user");
                callback(new HttpError(403, "Anonymous session may not connect"));
            }
            
            log.debug("user==" + user);
            
            handshake.user = user;
            
            callback(null);
        }
    
    
    ], function(err) {
        if (!err) {
            return callback(null, true);
        }
        
        if (err instanceof HttpError) {
            return callback(null, false);
        }
        
        callback(err);
    });
   
    
});


io.sockets.on('session:reload', function(sid) {
    
    log.debug("session reload function is start");
    
    let clients = io.sockets.clients();
    
    clients.forEach(function(client) {
        if (client.handshake.session.id !== sid) return;
        
        loadSession(sid, function(err, session) {
            if (err) {
                client.emit("error", "server error");
                client.disconnect();
                return;
            }
            
            if (!session) {
                client.emit("logout");
                client.disconnect();
                return;
            }
            
            client.handshake.session = session;
        });
        
    });
    
});

io.sockets.on('connection', function(socket) {

   log.debug("socket connection start");
   
   log.debug("socket.handshake= " + JSON.stringify(socket.handshake));
   
   let hg = socket.handshake.getSession();
       
   log.debug(hg);
   

   let username = socket.handshake.user;
  
   
   socket.broadcast.emit('join', username);
   
   socket.on('message', function(text, cb) {
        socket.broadcast.emit('message', username, text);
        cb && cb();
        
    });
    
    socket.on('disconnect', function() {
        socket.broadcast.emit('leave', username);
    });
    
});

return io;


};
