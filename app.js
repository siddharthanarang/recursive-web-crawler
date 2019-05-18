'use strict';

import express      from 'express'
import path         from 'path';
import cookieParser from 'cookie-parser';
import config       from 'config';

import logging      from './routes/logging';
import mysqlLib     from './databases/mysql/mysqlLib';
import urlQueue     from './routes/webCrawler/urlQueue';



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



const appStartup = async () => {
  try {
      await mysqlLib.initializeConnectionPool(config.get("databaseSettings.mysql")); // initializing mysql connection
      await urlQueue.initiateCrawling();
      logging.trace({event : "appStartup"});
    }
  catch(e){
    logging.error({event : "appStartup", error : e});
  }
};

appStartup();