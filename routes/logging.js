var moment           = require('moment');
module.exports.trace = trace;
module.exports.error = error;

function trace() {
  var stream = process.stdout;
  for(var i = 0; i <= arguments.length; i++){
    if(arguments[i]){
      stream.write(moment().utc().add(330, 'minutes').format("YYYY-MM-DD HH:mm:ss") + ':::' + JSON.stringify(arguments[i]) + '\n');
    }
  }
}

function error() {
  var stream = process.stderr;
  for(var i = 0; i <= arguments.length; i++){
    if(arguments[i]){
      stream.write(moment().utc().add(330, 'minutes').format("YYYY-MM-DD HH:mm:ss") + ':::' + JSON.stringify(arguments[i]) + '\n');
    }
  }
}