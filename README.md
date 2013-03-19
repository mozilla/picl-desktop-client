PICL Desktop Client
===================

This is the desktop Firefox client for PiCL (Profile in the CLoud). This add-on will sync passwords, tabs, and bookmarks with the [picl-server](https://github.com/mozilla/picl-server), encrypted with keys provided by the [picl-keyserver](https://github.com/mozilla/picl-keyserver).

Running and testing the PICL Desktop Client requires the [Jetpack SDK](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/). Installation instructions are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/installation.html). Testing and running the add-on depends heavily on [cfx](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html), a command line tool included with the SDK.

By default, the add-on runs against and is tested against the "standup" dev servers. To run it against locally running servers, set `LOCAL_SERVERS=true` in `lib/config.js`. When `LOCAL_SERVERS=true`, the add-on assumes the key server is running at `127.0.0.1:8090` and the storage server is running at `127.0.0.1:8080`.

Running
-------

To run in a temporary profile:

    cfx run

To run with an existing profile: 

    cfx run -p /path/to/profile

To run with a different build of firefox:

    cfx run -b /path/to/binary

More cfx run options are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html).

Testing
-------

Tests are included in the `test` subdirectory and are Javascript files prefixed with `test-`. 

To run all the tests:

    cfx test --verbose

To run only a subset of the tests, use `-f FILENAME[:TESTNAME]`, both regular expressions, for example:

    cfx test --verbose -f storageserver:getCollectionsInfo

To run tests in a way that filters the annoying warnings:

    cfx test --verbose 2>&1 >/dev/null | grep -v NS_ERROR_XPC_BAD_CONVERT

The `-b` and `-p` switches apply here as well. More cfx test options are [here](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html).

