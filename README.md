# WebdriverIO & Selenium Test Harness

## API

### Setup
`setup` takes an object of options for both **webdriverio** and **selenium**.  
`setup` returns a **Promise** of harness state which contains the **webdriverio** client and the **selenium** process.

Options are namespaced by **webdriverio** and **selenium**.  
Each of the options will reflect the APIs provided in these documents.

##### WebdriverIO
**init**  
http://webdriver.io/api/protocol/init.html

**remote**  
http://webdriver.io/guide/getstarted/configuration.html

##### Selenium Standalone
https://www.npmjs.com/package/selenium-standalone

#### Example

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

`teardown` takes harness state and then closes the **webdriverio** client and **selenium** process.  
`teardown` will return a **Promise** of undefined.

```javascript
harness.teardown(state).then(function () {
  // etc
})
```

## Installation

```shell
npm i -D webdriverio
npm i -D selenium-standalone
npm i -D webdriverio-selenium-harness
```

## Usage

The test harness is useful for running End to End tests.  
Just require the module and call `setup` and `teardown` in your `before` and `after` hooks.

#### Example

```javascript
// Mocha

var harness = require('webdriverio-selenium-harness')
var options = {}

describe('Feature', function () {
  before(function () {
    var self = this
    self.harnessState = harness.setup(options)
    return harnessState.then(function (state) {
      self.browser = state.browser
    })
  })
  
  after(function () {
    var self = this
    return self.harnessState.then(harness.teardown)
  })
  
  // Tests ...
})
```

**Caveats**  
 * If you want to use **PhantomJS** make sure you have it installed.
 * Install Selenium by running `./node_modules/.bin/selenium-standalone install`.  
 https://www.npmjs.com/package/selenium-standalone  

## Peer Dependencies

* [webdriveio](https://www.npmjs.com/package/webdriverio)
* [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
