var clear = require('../ultis/clear');
var chalk = require('chalk');
var figlet = require('figlet');
var inquirer = require('inquirer');

module.exports = function initProject(callback) {

  clear();
  console.log('');
  console.log(
    chalk.yellow(
      figlet.textSync('RN Redux', { horizontalLayout: 'full' })
    )
  );

  var questions = [
    {
      message: "Are you use redux in project ?",
      type: "confirm",
      name: "isRedux",
      validate: function validateFirstName(value) {
        if (value) {
          return true;
        } else {
          console.log('Please enter Y/N');
          return false;
        }
      }
    }];

  inquirer.prompt(questions).then(res => {
    callback(res.isRedux);
  });

}
