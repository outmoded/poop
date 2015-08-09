![poop Logo](https://raw.github.com/hapijs/poop/master/images/poop.png)

[**hapi**](https://github.com/hapijs/hapi) plugin for taking a process dump and cleaning up after an uncaught exception

[![Current Version](https://img.shields.io/npm/v/poop.svg)](https://www.npmjs.org/package/poop)
[![Build Status](https://secure.travis-ci.org/hapijs/poop.png)](http://travis-ci.org/hapijs/poop)

Lead Maintainer: [Colin Ihrig](https://github.com/cjihrig)

## Table of Contents

- [Overview](#overview)
- [Example](#example)
- [Settings](#settings)
    - [`logPath`](#logpath)

## Overview

When an `uncaughtException` is encountered a heap dump will be output to the
plugin folder. A log file is also written containing the exception details.
After this is complete the process will exit with a failure code.

## Example

The following example shows how to register and configure **poop**. In this example,
an uncaught exception is thrown after **poop** is registered. This will trigger a
heap dump and `poop.log` file to be created.

```javascript
'use strict';

var Path = require('path');
var Hapi = require('hapi');
var Poop = require('poop');
var server = new Hapi.Server();

server.register({
    register: Poop,
    options: {
        logPath: Path.join(__dirname, 'poop.log')
    }
}, function () {

    throw new Error('uncaught');
});
```

It is also possible to override the default write stream options for the log file. Using the previous example, the append flag `a` can be passed to the `register` function to append to the previously logged crash.

```javascript
'use strict';

var Path = require('path');
var Hapi = require('hapi');
var Poop = require('poop');
var server = new Hapi.Server();

server.register({
    register: Poop,
    options: {
        logPath: Path.join(__dirname, 'poop.log'),
        writeStreamOptions: {
            flags: 'a'
        }
    }
}, function () {

    throw new Error('uncaught');
});
```
## Settings

The following options are available when configuring **poop**.

### `logPath`

The file path to log any uncaught exception errors. Defaults to `poop.log` in
the plugin folder.

### `writeStreamOptions`

An object for the write stream options. Defaults to:
```javascript
{
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0666
}
```
