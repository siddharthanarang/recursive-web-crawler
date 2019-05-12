var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var Promise      = require('bluebird');
var config       = require('config');

var logging      = require('./routes/logging');
var mysqlLib     = require('./databases/mysql/mysqlLib');
var urlQueue     = require('./routes/webCrawler/urlQueue');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

appStartup();

function appStartup() {
  Promise.coroutine(function*(){
    yield mysqlLib.initializeConnectionPool(config.get("databaseSettings.mysql")); // initializing mysql connection
    yield urlQueue.initiateCrawling();

  })().then((data)=>{
    logging.trace({event : "appStartup", data : data});
  },(error) =>{
    logging.error({event : "appStartup", error : error});
  });

}

module.exports = app;