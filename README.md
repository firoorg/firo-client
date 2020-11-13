# Firo Client

![](.github/github-firo-client-header.png)

This is an (experimental) client for the [Firo](https://firo.io/) network. Currently, it requires connection to a
fully trusted firod full node.

## Installing firod

For an unbundled install, it's required that you manually link binaries compiled from the `client-api` branch of the
[firo repository](https://github.com/firoofficial/firo) into the appropriate directory for your system.

### Pulling and Building firod

Clone the firod repository

```bash
git clone --branch client-api https://github.com/firoorg/firo
```

Now you must build firod, instructions for which will be located in `doc/build`, in the `README*.md` and `build*.md`
files relevant to your platform. In addition to the instructions included there, the additional flag `--enable-clientapi`
must be passed to the `./configure` script when it is invoked during the build process as described in the aforementioned
files. (If this flag is not passed correctly during the buld process, the client will timeout on bootup with an unhelpful
error message.)

Once firod is built, it will be located at `src/firod` relative to the directory you cloned firo into. You must then
copy it into `assets/core/win32`, `assets/core/linux`, or `assets/core/darwin`. e.g. if you followed the command above
from firo-client's root directory and are building for Mac, `cp firo/src/firod assets/core/darwin`. In order to
build Firo Client binaries on other platforms, you must include firod binaries built for that platform in the appropriate directory.

#### Updating firod

To update `firod`, simply run `git pull` in the `firod` directory, and run `make`.

## Installing npm Packages

To install dependencies for the client itself, run

```bash
npm install
npm run rebuild-zeromq
```

## Starting firo-client

To run the development version of firo-client, simply run

```bash
npm run dev
```

### Debug Levels

By default, firo-client will log to `userData/combined.log` in the application data directory at debug level. This
can be changed with the environment variable `ZCOIN_CLIENT_DEBUG_LEVEL`.

### REPL

If the client is started with the `ZCOIN_CLIENT_REPL` environment variable set to `true`, the client will not start
and instead Chrome Dev Tools will be launched with the global variable Firod set to the Firod class from
`src/daemon/firod.ts`. It can then be used to interact with the daemon as documented in that file. The daemon will
NOT be stopped automatically on exit.

### Forcing Reinitialization

If you want to reinitialize the client and don't want to use the `resetclientconfig` command in the debug console, you
can set the enviornment variable `REINITIALIZE_ZCOIN_CLIENT` to `true`. If this is set, Firo Client will show the setup
screen on startup regardless of whether it has already been initialized.

### Connecting to an Existing Firod

If you want to allow the client to connect to an existing instance of firod, you can set the environment variable
`ALLOW_EXISTING_ZCOIND` to `true`. Note that the existing firod instance will be shut down when the client exits.

### Firod Connection Timeout

By default, if firod fails to start within 30 seconds, Firo Client will timeout. This value can be changed with by
setting the environment variable `ZCOIND_CONNECTION_TIMEOUT` to the number of seconds you want to change the timeout to.

## Getting Assistance

If you need assistance with this project, you can join the official Firo Telegram group
[@firoproject](https://t.me/firoproject)
