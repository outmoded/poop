![poop Logo](https://raw.github.com/hapijs/poop/master/images/poop.png)

[`hapi`](https://github.com/hapijs/hapi) plugin for taking a process dump and cleaning up after an uncaught exception

[![Current Version](https://img.shields.io/npm/v/poop.svg)](https://www.npmjs.org/package/poop)
[![Build Status](https://secure.travis-ci.org/hapijs/poop.png)](http://travis-ci.org/hapijs/poop)

Lead Maintainer: [Colin Ihrig](https://github.com/cjihrig)

## Table of Contents

- [Overview](#overview)
- [Example](#example)
- [Settings](#settings)
    - [`logPath`](#logpath)
    - [`writeStreamOptions`](#writestreamoptions)

## Overview

When an `uncaughtException` is encountered a heap dump will be output to the
plugin folder. A log file is also written containing the exception details.
After this is complete the process will exit with a failure code. Heap dumps can
also be taken at arbitrary times by sending a `SIGUSR1` signal to the server
process.

## Example

The following example shows how to register and configure `poop`. In this example,
an uncaught exception is thrown after `poop` is registered. This will trigger a
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

## Settings

The following options are available when configuring `poop`.

### `logPath`

The file path to log any uncaught exception errors. Defaults to `poop.log` in
the plugin folder.

### `writeStreamOptions`

Options passed to the write stream of the log file. Uses Node's defaults:

```javascript
{
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0666
}
```
