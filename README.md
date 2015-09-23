# WebdriverIO & Selenium Test Harness

## API

### Setup
`setup` takes an object of options for both **webdriverio** and **selenium**.  
`setup` returns a **Promise** of harness state which contains the **webdriverio** client and the **selenium** process.  
The options are namespaced for **webdriverio** and **selenium**, and each of the options will reflect the APIs provided in these documents.

#### WebdriverIO
##### init
http://webdriver.io/api/protocol/init.html
##### remote
http://webdriver.io/guide/getstarted/configuration.html

#### Selenium Standalone
https://www.npmjs.com/package/selenium-standalone

```javascript
var options = {
  webdriverio: {
    remote: {
      desiredCapabilities: {
        browserName: 'phantomjs' // chrome, firefox
      }
    },
    init: {}
  }
  selenium: {
    seleniumArgs: []
  }
}

harness.setup(options).then(function (state) {
  var browser = state.browser
  var selenium = state.selenium
})

```

### Teardown

`teardown` takes harness state, then closes the **webdriverio** client and **selenium** process.  
`teardown` will return a **Promise** of undefined.

```javascript
harness.teardown(state).then(function () {
  // after hook
})
```

## Installation

```shell
npm i -D webdriverio
npm i -D selenium-standalone
npm i -D webdriverio-selenium-harness
```

## Usage


**Caveats**  
Install Selenium by running `./node_modules/.bin/selenium-standalone install`. https://www.npmjs.com/package/selenium-standalone  

If you want to use **PhantomJS** make sure you have it installed

## Peer Dependencies

* [webdriveio](https://www.npmjs.com/package/webdriverio)
* [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
