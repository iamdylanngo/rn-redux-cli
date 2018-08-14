var { execSync } = require('child_process');

// execSync('ls -a',  { stdio: 'inherit' });
// execSync('node node_modules/vnrm/bin/index.js rn-redux-templates1', { stdio: 'inherit' });
// execSync('git clone https://github.com/jundat95/rn-redux-templates1.git', { stdio: 'inherit' });

var github = 'https://github.com/jundat95/rn-redux-templates1.git';
var temp = github.split('/');
var temp1 = temp[temp.length - 1].split('.');
console.log(temp1[0]);