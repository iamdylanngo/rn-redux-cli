var inquirer = require('inquirer');

module.exports = function selectTemplate(callback) {

  console.log('');
  var options = [
    {
      message: "Choose template base project: ",
      type: "list",
      name: "selectTemplate",
      choices: [
        { value: "temp1", name: "choose templates - redux base" },
        { value: "temp2", name: "choose templates - redux with features" },
        { value: "temp3", name: "choose templates - redux-saga" },
        { value: "temp0", name: "customs templates " },
      ]
    }
  ];

  inquirer.prompt(options).then((res) => {
    callback(res.selectTemplate);
  });

}
