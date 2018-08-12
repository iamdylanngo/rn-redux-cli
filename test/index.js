var fs = require('fs');
var path = require('path');
var copydir = require('copy-dir');

var packagePath = __dirname + '/test1/package.json';
var package = null;
if (fs.existsSync(packagePath)) {
  package = require(__dirname + '/test1/package.json');
}

copydir.sync(__dirname + '/test1/', __dirname + '/test2/', function (stat, filepath, filename) {
  if (stat === 'file' && path.extname(filepath) === '.json') {
    return false;
  }
  if (stat === 'directory' && filename === '.json') {
    return false;
  }
  return true;
}, function (err) {
  console.log('error: ');
  console.log(err);
});

if (package) {
  console.log("package: ");
  // console.log(package.dependencies);
  if (package.dependencies) {
    for (var item in package.dependencies) {
      console.log(item + '-' + package.dependencies[item]);
    }
  }

}
