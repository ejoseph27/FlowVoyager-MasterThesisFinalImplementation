const fs = require('fs');
const table={};

module.exports.startTimer=(context)=>{
  table[context]=new Date().getTime();
}
module.exports.stopTimer=(context)=>{
 const endTime=new Date().getTime();
 let startTime=0;
 if(table[context]){
  startTime=table[context];
}
const log = `${context} started at  ${new Date(startTime).toISOString()} and  stopped at ${new Date(endTime).toISOString()} (duration: ${endTime-startTime}ms) \n`; // Create log message with timestamp
fs.appendFile('app.log', log, (err) => {
  if (err) throw err;
  console.log(`Logged: ${log}`);

});
}
