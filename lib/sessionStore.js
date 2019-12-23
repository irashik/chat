
const connection                      = require('./mongoose');
const session                       = require('express-session');




const MongoStore = require('connect-mongo')(session);

const sessionStore = new MongoStore({ mongooseConnection: connection });

module.exports = sessionStore;

