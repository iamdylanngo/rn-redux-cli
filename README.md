## Running CLI with local modifications

React Native is distributed as two npm packages, `rn-redux` and `rn-redux`. The first one is a lightweight package that should be installed globally (`npm install -g rn-redux`), while the second one contains the actual React Native framework code and is installed locally into your project when you run `rn-redux init`.

Because `rn-redux init` calls `npm install rn-redux`, simply linking your local github clone into npm is not enough to test local changes.

## Install RN-Redux CLI

### Install
```bash
npm i -g rn-redux
```

## Running the local CLI

Now that the packages are installed in sinopia, you can install the new `rn-redux` package globally and when you use `rn-redux init`, it will install the new `rn-redux` package as well:

```bash
npm uninstall -g rn-redux
npm install -g rn-redux
rn-redux init AwesomeApp
rn-redux init AwesomeApp --version 0.55.3
```

Note that `REACT_NATIVE_REDUX_GITHUB` should point to the directory where you have a checkout.

Also, if the changes you're making get triggered when running `rn-redux init AwesomeProject` you will want to tweak the global installed `rn-redux-cli` library to install the local checkout instead of downloading the module from npm. To do so just change this [line](https://github.com/jundat95/rn-redux-cli) and refer the local checkout instead.
