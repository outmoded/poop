![poop Logo](https://raw.github.com/hapijs/poop/master/images/poop.png)

[**hapi**](https://github.com/hapijs/hapi) plugin for taking a process dump and cleaning up after an uncaught exception

[![Current Version](https://img.shields.io/npm/v/poop.svg)](https://www.npmjs.org/package/poop)
[![Build Status](https://secure.travis-ci.org/hapijs/poop.png)](http://travis-ci.org/hapijs/poop)

Lead Maintainer: [Colin Ihrig](https://github.com/cjihrig)


The following options are available when configuring _'poop'_:

- `logPath` - the file path to log any uncaught exception errors.  Defaults to 'poop.log' in the plugin folder.


When an _'uncaughtException'_ is encountered a heap dump will be output to the plugin folder as well as the exception details.
After this is complete the process will exit with a 'failure' code.
