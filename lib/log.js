var winston = require('winston');
//var ENV = process.env.NODE_ENV;

const { createLogger, format, transports, level } = require('winston');
const { printf, combine, timestamp, label, prettyPrint, simple, colorize, splat} = format;


//console.log(ENV);

//Logging levels
const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7
  },
  colors: {
    error: 'red',
    debug: 'yellow',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow'
  }
};

winston.addColors(config.colors);


const myFormat = printf(({ leve, message, label, timestamp }) => {
    return `[${label}] ${level}: ${message}`;
});


function getLogger(module) {
    
  var path = module.filename.split('/').slice(-2).join('/');


  const logger = new createLogger({
        
        levels: config.levels,
        transports: [ 
            new transports.Console()], 
        format: 
                combine(
                 colorize({ all: true}),
                 simple(),
                 label({label: path }),
                 splat(),
                 myFormat
                
            ),
        level: 'custom'
    });
    
    return logger
};
    

//logger.warn('hello');
//getLogger('hello');

module.exports = getLogger;