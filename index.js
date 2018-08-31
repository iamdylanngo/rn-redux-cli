#!/usr/bin/env node

/**
 * Copyright (c) 2018 Jundat95.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// rn-redux-cli is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// The only job of rn-redux-cli is to init the repository and then
// forward all the commands to the local version of rn-redux.
//
// If you need to add a new command, please add it to local-cli/.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `rn-redux init` command.
//
// To allow for graceful failure on older node versions, this file should
// retain ES5 compatibility.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of rn-redux-cli.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var chalk = require('chalk');
var prompt = require('prompt');
var semver = require('semver');
var copydir = require('copy-dir');
var vnrm = require('vnrm');
var initProject = require('./ultis/init-project');
var selectTemplates = require('./ultis/select-templates');
var customTemplate = require('./ultis/custom-template');
var getFolder = require('./ultis/get-folder');

/**
 * Used arguments:
 *   -v --version - to print current version of rn-redux-cli and rn-redux dependency
 *   if you are in a RN app folder
 * init - to create a new project and npm install it
 *   --verbose - to print logs while init
 *   --template - name of the template to use, e.g. --template navigation
 *   --version <alternative rn-redux package> - override default (https://registry.npmjs.org/rn-redux@latest),
 */


var options = require('minimist')(process.argv.slice(2));

var CLI_MODULE_PATH = function () {
    return path.resolve(
        process.cwd(),
        'node_modules',
        'react-native',
        'cli.js'
    );
};

var REACT_NATIVE_PACKAGE_JSON_PATH = function () {
    return path.resolve(
        process.cwd(),
        'node_modules',
        'react-native',
        'package.json'
    );
};

if (options._.length === 0 && (options.v || options.version)) {
    printVersionsAndExit(REACT_NATIVE_PACKAGE_JSON_PATH());
}

// Use Yarn if available, it's much faster than the npm client.
// Return the version of yarn installed on the system, null if yarn is not available.
function getYarnVersionIfAvailable() {
    var yarnVersion;
    try {
        // execSync returns a Buffer -> convert to string
        if (process.platform.startsWith('win')) {
            yarnVersion = (execSync('yarn --version 2> NUL').toString() || '').trim();
        } else {
            yarnVersion = (execSync('yarn --version 2>/dev/null').toString() || '').trim();
        }
    } catch (error) {
        return null;
    }
    // yarn < 0.16 has a 'missing manifest' bug
    try {
        if (semver.gte(yarnVersion, '0.16.0')) {
            return yarnVersion;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Cannot parse yarn version: ' + yarnVersion);
        return null;
    }
}

var cli;
var cliPath = CLI_MODULE_PATH();
if (fs.existsSync(cliPath)) {
    cli = require(cliPath);
}

var commands = options._;
if (cli) {
    cli.run();
} else {
    if (options._.length === 0 && (options.h || options.help)) {
        console.log([
            '',
            '  Usage: rn-redux [command] [options]',
            '',
            '',
            '  Commands:',
            '',
            '    init <ProjectName> [options]  generates a new project and installs its dependencies',
            '',
            '  Options:',
            '',
            '    -h, --help    output usage information',
            '    -v, --version use a specific version of React Native',
            '    --template use an app template. Use --template to see available templates.',
            '',
        ].join('\n'));
        process.exit(0);
    }

    if (commands.length === 0) {
        console.error(
            'You did not pass any commands, run `rn-redux --help` to see a list of all available commands.'
        );
        process.exit(1);
    }

    switch (commands[0]) {
        case 'init':
            if (!commands[1]) {
                console.error(
                    'Usage: rn-redux init <ProjectName> [--verbose]'
                );
                process.exit(1);
            } else {
                init(commands[1], options);
            }
            break;
        default:
            console.error(
                'Command `%s` unrecognized. ' +
                'Make sure that you have run `npm install` and that you are inside a react-native project.',
                commands[0]
            );
            process.exit(1);
            break;
    }
}

function validateProjectName(name) {
    if (!String(name).match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
        console.error(
            '"%s" is not a valid name for a project. Please use a valid identifier ' +
            'name (alphanumeric).',
            name
        );
        process.exit(1);
    }

    if (name === 'React') {
        console.error(
            '"%s" is not a valid name for a project. Please do not use the ' +
            'reserved word "React".',
            name
        );
        process.exit(1);
    }
}

/**
 * @param name Project name, e.g. 'AwesomeApp'.
 * @param options.verbose If true, will run 'npm install' in verbose mode (for debugging).
 * @param options.version Version of React Native to install, e.g. '0.38.0'.
 * @param options.npm If true, always use the npm command line client,
 *                       don't use yarn even if available.
 */
function init(name, options) {
    validateProjectName(name);

    if (fs.existsSync(name)) {
        createAfterConfirmation(name, options);
    } else {
        createProject(name, options);
    }
}

function createAfterConfirmation(name, options) {
    prompt.start();

    var property = {
        name: 'yesno',
        message: 'Directory ' + name + ' already exists. Continue?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no'
    };

    prompt.get(property, function (err, result) {
        if (result.yesno[0] === 'y') {
            createProject(name, options);
        } else {
            console.log('Project initialization canceled');
            process.exit();
        }
    });
}

function createProject(name, options) {
    var root = path.resolve(name);
    var projectName = path.basename(root);

    console.log(
        'This will walk you through creating a new React Native project in',
        root
    );

    if (!fs.existsSync(root)) {
        fs.mkdirSync(root);
    }

    var packageJson = {
        name: projectName,
        version: '0.0.1',
        private: true,
        scripts: {
            start: 'node node_modules/react-native/local-cli/cli.js start',
            ios: 'react-native run-ios',
            android: 'react-native run-android',
        }
    };
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson));
    process.chdir(root);

    run(root, projectName, options);
}

function getInstallPackage(rnPackage) {
    var packageToInstall = 'react-native';
    var isValidSemver = semver.valid(rnPackage);
    if (isValidSemver) {
        packageToInstall += '@' + isValidSemver;
    } else if (rnPackage) {
        // for tar.gz or alternative paths
        packageToInstall = rnPackage;
    }
    return packageToInstall;
}


async function run(root, projectName, options) {
    var rnPackage = options.version; // e.g. '0.38' or '/path/to/archive.tgz'
    var forceNpmClient = options.npm;
    var yarnVersion = (!forceNpmClient) && getYarnVersionIfAvailable();
    var installCommand;
    if (options.installCommand) {
        // In CI environments it can be useful to provide a custom command,
        // to set up and use an offline mirror for installing dependencies, for example.
        installCommand = options.installCommand;
    } else {
        if (yarnVersion) {
            console.log('Using yarn v' + yarnVersion);
            console.log('Installing ' + getInstallPackage(rnPackage) + '...');
            installCommand = 'yarn add ' + getInstallPackage(rnPackage) + ' --exact';
            if (options.verbose) {
                installCommand += ' --verbose';
            }
        } else {
            console.log('Installing ' + getInstallPackage(rnPackage) + '...');
            if (!forceNpmClient) {
                console.log('Consider installing yarn to make this faster: https://yarnpkg.com');
            }
            installCommand = 'npm install --save --save-exact ' + getInstallPackage(rnPackage);
            if (options.verbose) {
                installCommand += ' --verbose';
            }
        }
    }
    try {
        execSync(installCommand, { stdio: 'inherit' });

    } catch (err) {
        console.error(err);
        console.error('Command `' + installCommand + '` failed.');
        process.exit(1);
    }
    checkNodeVersion();
    cli = require(CLI_MODULE_PATH());
    cli.init(root, projectName);

    // Set up new project
    initProject((userSelect) => {
        if (!userSelect) return;
        selectTemplates(temp => {
            if (temp !== 'temp0') {
                var pathTemplates = __dirname + '/templates/' + temp;
                moveProject(pathTemplates, root, () => {
                    
                });
            } else {
                customTemplate(res => {
                    if (res === 'local') {
                        getFolder('enter folder: ', folder => {
                            var pathTemplates = folder;
                            if (fs.existsSync(pathTemplates)) {
                                moveProject(pathTemplates, root, () => {
                                    // copy project success
                                });
                            } else {
                                console.log(`folder don't exists`);
                            }
                        });
                    } else {
                        getFolder('enter url github: ', url => {
                            cloneGithub(url, root);
                        });
                    }
                });
            }
        });

    });

}

async function cloneGithub(url, root) {
    var temp = url.split('/');
    var name = temp[temp.length - 1].split('.')[0];
    if (fs.existsSync(name))
        return console.log('folder ' + name + ' is exists');

    await execSync('git clone ' + url, { stdio: 'inherit' });
    await moveProject(root + '/' + name, root, () => {
        vnrm(root + '/' + name, err => {
            if (err)
                console.log(err);
        });
    });

}


/**
 * moveProject
 * @param {path folder copy to project} pathTemplates 
 * @param {path project current} root 
 */
async function moveProject(pathTemplates, root, callback) {
    console.log('\nCopy templates to new project...');

    // install package
    await installPackage(pathTemplates, root);

    copydir(
        pathTemplates,
        root,
        function (stat, filepath, filename) {
            // Don't copy file .json in rootFolder to new project
            if (stat === 'file' && path.extname(filepath) === '.json' && filepath === pathTemplates + filename) {
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
                callback();
            } else {
                // console.log('copy file success');

                fs.unlink(root + '/App.js', function (error) {
                    if (error) {
                        console.error(error);
                        callback();
                    }
                    // console.log('deleted App.js');
                    console.log('\nCopy templates success\n');
                    callback();
                });
            }
        });

}

/**
 * 
 * @param {path templates} pathTemplates 
 * @param {path root} root 
 */
async function installPackage(pathTemplates, root) {
    var packagePath = pathTemplates + '/package.json';
    var packageJson = null;
    if (fs.existsSync(packagePath)) {
        packageJson = require(packagePath);
    }

    if (packageJson) {
        if (packageJson.dependencies) {
            for (var item in packageJson.dependencies) {
                // console.log(item + '-' + package.dependencies[item]);
                await execSync('npm i --save ' + item + '@' + packageJson.dependencies[item], { stdio: 'inherit' });
            }
        }
        if (packageJson.devDependencies) {
            for (var item in packageJson.devDependencies) {
                // console.log(item + '-' + package.devDependencies[item]);
                await execSync('npm i --save-dev ' + item + '@' + packageJson.devDependencies[item], { stdio: 'inherit' });
            }
        }

    }
}

function checkNodeVersion() {
    var packageJson = require(REACT_NATIVE_PACKAGE_JSON_PATH());
    if (!packageJson.engines || !packageJson.engines.node) {
        return;
    }
    if (!semver.satisfies(process.version, packageJson.engines.node)) {
        console.error(chalk.red(
            'You are currently running Node %s but React Native requires %s. ' +
            'Please use a supported version of Node.\n'
        ),
            process.version,
            packageJson.engines.node);
    }
}

function printVersionsAndExit(reactNativePackageJsonPath) {
    console.log('rn-redux-cli: ' + require('./package.json').version);
    try {
        console.log('rn-redux: ' + require(reactNativePackageJsonPath).version);
    } catch (e) {
        console.log('rn-redux: n/a - not inside a React Native project directory');
    }
    process.exit();
}