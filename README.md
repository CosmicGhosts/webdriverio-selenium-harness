# WebdriverIO & Selenium Test Harness

## API

### Setup

`setup` takes an object of options for both webdriverio and selenium.
`setup` returns a Promise of harness state that contains the browser client from webdriverio and the selenium process

```javascript
var options = {
  webdriverio: {}
  selenium: {}
}

harness.setup(options).then(function (state) {
  var browser = state.browser
  var selenium = state.selenium
})

```

### Teardown

`teardown` takes the harness state and closes the browser client and selenium process.
`teardown` will return a Promise of undefined.

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

## Peer Dependencies

* [webdriveio](https://www.npmjs.com/package/webdriverio)
* [selenium-standalone](https://www.npmjs.com/package/selenium-standalone)
