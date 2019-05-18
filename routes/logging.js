import moment from 'moment';


function trace() {
  const stream = process.stdout;
  for(let i = 0; i <= arguments.length; i++){
    if(arguments[i]){
      stream.write(moment().utc().add(330, 'minutes').format("YYYY-MM-DD HH:mm:ss") + ':::' + JSON.stringify(arguments[i]) + '\n');
    }
  }
}

function error() {
  const stream = process.stderr;
  for(let i = 0; i <= arguments.length; i++){
    if(arguments[i]){
      stream.write(moment().utc().add(330, 'minutes').format("YYYY-MM-DD HH:mm:ss") + ':::' + JSON.stringify(arguments[i]) + '\n');
    }
  }
}

export default {trace, error};