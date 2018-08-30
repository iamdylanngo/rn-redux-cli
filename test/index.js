var fs = require('fs');
var path = require('path');
var assert = require('assert');

var templatePath = function () {
    return path.resolve(
        process.cwd(),
        'templates'
    );
};
var rootTemplatePath = templatePath();

describe('Test Templates', function() {
    
    it('check path templates 1', function() {
        var temp1 = fs.existsSync(rootTemplatePath + '/temp1');
        assert.equal(true, temp1);
    });

    it('check path templates 2', function() {
        var temp2 = fs.existsSync(rootTemplatePath + '/temp2');
        assert.equal(true, temp2);
    });

});