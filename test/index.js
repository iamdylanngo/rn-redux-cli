// require('child_process')
//   .spawn('npm', ['i','--save','redux','react-redux','--save-exact'], {stdio:'inherit'})
//   .on('exit', function (error) {

//     if(!error){
//       console.log('Success!');
//     }

//   });

var execSync = require('child_process').execSync;

try {
  execSync('cd templates', { stdio: 'inherit' });
  execSync('npm i --save redux react-redux', { stdio: 'inherit' });
  console.log('install sucess');
} catch(ex) {
  console.error(ex);
}