var clear = require('../ultis/clear');
var chalk = require('chalk');
var inquirer = require('inquirer');

module.exports = function selectTemplate(callback) {

  clear();
  console.log('');
  var options = [
    {
      message: "Choose template base project: ",
      type: "list",
      name: "selectTemplate",
      choices: [
        { value: "temp1", name: "choose templates 1" },
        { value: "temp2", name: "choose templates 2" },
        { value: "temp3", name: "choose templates 3" },
        { value: "temp0", name: "customs templates " },
      ]
    }
  ];

  inquirer.prompt(options).then((res) => {
    callback(res.selectTemplate);
  });

}
