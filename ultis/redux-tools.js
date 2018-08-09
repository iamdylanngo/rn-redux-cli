var clear = require('../ultis/clear');
var chalk = require('chalk');
var figlet = require('figlet');
var inquirer = require('inquirer');

var userSelect = 0;

module.exports = async function initRedux(callback) {

    clear();
    console.log();
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
            userSelect = 1;
            return true;
          } else {
            console.log('Please enter Yes/No');
            return false;
          }
        }
      }];

    let useRedux = await inquirer.prompt(questions);

    if (!useRedux.isRedux) {
      callback(userSelect);
    } else{
      callback(1);
    }

}

