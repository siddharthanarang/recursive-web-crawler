var mysql                                      = require('mysql');
var logging                                    = require('../../routes/logging');

module.exports.initializeConnectionPool        = initializeConnectionPool;
module.exports.mysqlQueryPromise               = mysqlQueryPromise;
var connection;


function initializeConnectionPool(dbConfig) {
  return new Promise((resolve, reject) =>{
    logging.trace({event : "CALLING INITIALIZE POOL"});
    var conn = mysql.createPool(dbConfig);
    connection = conn;
    return resolve();
  });
}

function mysqlQueryPromise(event, queryString, params) {
  return new Promise((resolve, reject) => {
    var query = connection.query(queryString, params, function (sqlError, sqlResult) {
      logging.trace({event : "Executing query " + event, query: query.sql, error: sqlError, result: sqlResult});
        if (sqlError) {
          return reject(sqlError);
        }
      return resolve(sqlResult);
    });
  });
}

