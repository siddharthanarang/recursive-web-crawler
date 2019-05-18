'use strict';

import mysql   from  'mysql';
import logging from  '../../routes/logging';


let connection;


const initializeConnectionPool = (dbConfig) => {
  return new Promise((resolve, reject) =>{
    logging.trace({event : "CALLING INITIALIZE POOL"});
    let conn = mysql.createPool(dbConfig);
    connection = conn;
    return resolve();
  });
};

const mysqlQueryPromise = (event, queryString, params) => {
  return new Promise((resolve, reject) => {
    let query = connection.query(queryString, params, function (sqlError, sqlResult) {
      logging.trace({event : "Executing query " + event, query: query.sql, error: sqlError, result: sqlResult});
        if (sqlError) {
          return reject(sqlError);
        }
      return resolve(sqlResult);
    });
  });
};

export default {initializeConnectionPool, mysqlQueryPromise};