var copydir = require('copy-dir');
var path = require('path');
var fs = require('fs');
var vnrm = require('vnrm');

console.log(__dirname);

copydir(
    __dirname + '/temp3',
    __dirname,
    function (stat, filepath, filename) {
        if (stat === 'file' && path.extname(filepath) === '.json') {
            return false;
        }
        if (stat === 'directory' && filename === '.json') {
            return false;
        }
        return true;
    },
    function (err) {
        if (err) {
            console.error(err);
        } else {
            // console.log('copy file success');

            fs.unlink(root + '/App.js', function (error) {
                if (error) {
                    console.error(error);
                }
                // console.log('deleted App.js');
                console.log('\nCopy templates success\n');
                vnrm(__dirname + '/temp3', err => {
                    console.log(err);
                });
            });
        }
    });

   