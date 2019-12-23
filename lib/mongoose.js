const mongoose = require('mongoose');
const config = require('../config');

const connection = mongoose.createConnection(
                   config.get('mongoose:uri'), config.get('mongoose:options'));
           
           
mongoose.Promise = global.Promise;

module.exports =  connection;



