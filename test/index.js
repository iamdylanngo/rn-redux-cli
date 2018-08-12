
// var execSync = require('child_process').execSync;

// try {
//   execSync('cd templates', { stdio: 'inherit' });
//   execSync('npm i --save redux react-redux', { stdio: 'inherit' });
//   console.log('install sucess');
// } catch(ex) {
//   console.error(ex);
// }
console.log('select temp');

var selectTemp = require('../ultis/select-templates');
selectTemp();
