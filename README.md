<a href="https://github.com/spumko"><img src="https://raw.github.com/spumko/spumko/master/images/from.png" align="right" /></a>
![poop Logo](https://raw.github.com/spumko/poop/master/images/poop.png)

[**hapi**](https://github.com/spumko/hapi) plugin for taking a process dump and cleaning up after an uncaught exception

[![Build Status](https://secure.travis-ci.org/spumko/poop.png)](http://travis-ci.org/spumko/poop)


The following options are available when configuring _'poop'_:

- `logPath` - the file path to log any uncaught exception errors.  Defaults to 'poop.log' in the plugin folder.


When an _'uncaughtException'_ is encountered a heap dump will be output to the plugin folder as well as the exception details.
After this is complete the process will exit with a 'failure' code.