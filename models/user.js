'use strict';

const db                      = require('../lib/mongoose');
const mongoose                = require('mongoose');
let Schema                    = mongoose.Schema;
const passportLocalMongoose   = require('passport-local-mongoose');
const bcrypt                  = require('bcrypt');
const log                     = require('../lib/log')(module);
const util                    = require('util');

 
 




let Account = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

Account.statics.setPassword = function(password, callback) {
    log.info("function setPassword is started");
    // берет пароль и генерирует хеш.
    let pass = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    log.debug('pass = ' + pass);
    callback(pass);
 };

Account.statics.verifyPassword = function(password, hash, callback) {
    
    log.info('verifyPassword start methods');
    bcrypt.compare(password, hash, function(err, res) {
        console.log('bcrypt started');
           if (err) {
               next(err);
           }
          if (res) {
            log.info('verify password - password true');
            callback(res);
          
          } else {
            log.info('verify password - password false');
            callback(res);
          }
        
    });
 

};











//Account.virtual('password')
//  .set(function(password) {
//    this._plainPassword = password;
//    this.salt = Math.random() + '';
//    this.hashedPassword = this.encryptPassword(password);
//  })
//  .get(function() { return this._plainPassword; });




//Account.methods.encryptPassword = function(password) {
//  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
//};





//schema.methods.checkPassword = function(password) {
//  return this.encryptPassword(password) === this.hashedPassword;
//};

//schema.statics.authorize = function(username, password, callback) {
//    var User = this;
//    
//    
//    async.waterfall([
//        function(callback) {
//            User.findOne({username: username}, callback);
//        }, 
//        function(user, callback) {
//            if (user) {
//                if (user.checkPassword(password)) {
//                    callback(null, user);
//                } else {
//                    callback(new AuthError("Пароль неверен"));
//                }
//            } else {
//                var user = new User({username: username, password: password});
//                user.save(function(err) {
//                    if (err) return callback(err);
//                    callback(null, user);
//                });
//            }
//            
//        }
//    ], callback);
//};



Account.plugin(passportLocalMongoose);

module.exports = db.model('Account', Account);


// обработчик ошибки авторизации
function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);
    
    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;