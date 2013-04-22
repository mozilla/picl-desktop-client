PICL Desktop Client
===================

This is the desktop Firefox client for PiCL (Profile in the CLoud). This add-on will sync passwords, tabs, and bookmarks with the [picl-server](https://github.com/mozilla/picl-server), encrypted with keys provided by the [picl-keyserver](https://github.com/mozilla/picl-keyserver). (Note: encryption is currently not being done.)

Running and testing the PICL Desktop Client requires the [Jetpack SDK](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/). Installation instructions are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/installation.html). Testing and running the add-on depends heavily on [cfx](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html), a command line tool included with the SDK.

By default, the add-on runs against and is tested against the "standup" dev servers. To run it against locally running servers, set `LOCAL_SERVERS=true` in `lib/config.js`. When `LOCAL_SERVERS=true`, the add-on assumes the key server is running at `127.0.0.1:8090` and the storage server is running at `127.0.0.1:8080`.

WARNING
-------
THIS IS DEVELOPMENT-QUALITY, PRE-ALPHA SOFTWARE. IT IS LACKING MANY SECURITY MECHANISMS, DOES NOT USE AUTHENTICATION OR ENCRYPTION, HAS NO DATA BACKUP, AND IS NOT STABLE. YOU MAY LOSE ALL YOUR PROFILE DATA WITH THIS ADD-ON. USE THIS ADD-ON WITH TEST PROFILES AND DATA ONLY.


Running
-------

To run in a temporary profile:

    cfx run

To run with an existing profile: 

    cfx run -p /path/to/profile

To run with a different build of Firefox:

    cfx run -b /path/to/binary

More cfx run options are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html).

Logging in with the NULL security architecture
----------------------------------------------
The UI to log in and log out of PICL is still a work in progress. Since we are currently using the "null security architecture", you can log in to PICL with any email address. To launch the add-on and log in as a specific email address: 

    cfx run --static-args="{ \"email\": \"<email>\"}"

If no email is given via `--static-args`, then the add-on will use a test account by default.

Logging in with Persona
-----------------------
The add-on also supports "login to the browser" with Persona, but you need a [special build of Nightly](http://ftp.mozilla.org/pub/mozilla.org/firefox/try-builds/jparsons@mozilla.com-bf2e09909f8b/). When using this special build of Nightly, first log in to the browser via `Persona Login` in the `Tools` menu. After logging in to the browser, follow the instructions for "Using PICL" below.

You can launch the add-on with this special Nightly build with:

    cfx run -a firefox -b /path/to/special/nightly/binary

e.g.:

    cfx run -a firefox -b /Applications/FirefoxNightly.app/Contents/MacOS/firefox

Using PICL
----------
The add-on adds `PICL Start` and `PICL Stop`
menu items to the Firefox `Tools` menu. `PICL Start` will start syncing against either the specified account or test account, and `PICL Stop` will stop syncing. Currently, bookmarks, passwords, and tabs are synced. 

`PICL Start` will also open a page that shows your open tabs on this and other synced browsers. You can reopen this page via the `PICL Tabs` menu item.

Testing
-------

Tests are included in the `test` subdirectory and are Javascript files prefixed with `test-`. 

To run all the tests:

    cfx test --verbose

To run only a subset of the tests, use `-f FILENAME[:TESTNAME]`, where `FILENAME` and `TESTNAME` are both regular expressions, for example:

    cfx test --verbose -f storageserver:getCollectionsInfo

To run tests in a way that filters the annoying warnings:

    cfx test --verbose 2>&1 >/dev/null | grep -v NS_ERROR_XPC_BAD_CONVERT

The `-b` and `-p` switches apply here as well. More cfx test options are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html).

