var inquirer = require('inquirer');

module.exports = function CustomTemplate(callback) {
    var options = [
        {
            name: "customTemplate",
            message: "Base folder in local workstation or github ?",
            type: "list",
            choices: [
                { value: "local", name: "in local workstation" },
                { value: "github", name: "in github" },
            ]
        }
    ];

    inquirer.prompt(options).then(res => {
        callback(res.customTemplate);
    });
}
