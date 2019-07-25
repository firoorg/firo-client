# Zcoin Client

![](.github/github-zcoin-client-header.png)

This is an (experimental) client for the [Zcoin](https://zcoin.io/) network. Currently, it requires connection to a
fully trusted zcoind full node. Windows support is currently slightly broken, but will be fixed shortly.

## Installing zcoind

For an unbundled install, it's required that you manually link binaries compiled from the `client-api` branch of the
[zcoin repository](https://github.com/zcoinofficial/zcoin) into the appropriate directory for your system.

### Pulling and Building zcoind

Clone the zcoind repository

```bash
git clone --branch client-api https://github.com/zcoinofficial/zcoin
```

Now you must build zcoind, instructions for which will be located in `doc/build`, in the `README*.md` and `build*.md`
files relevant to your platform. Once zcoind is built, the relevant binaries will be located in `./zcoin/src/`.

Now you must make a symbolic link from in your platform-specific directory to the generated binaries.

On OSX, this can be accomplished by running the following command from the `zcoin-client` (assuming you also ran `git`
from this directory):

```bash
for x in zcoind zcoin-tx zcoin-cli; do ln -s "$PWD/zcoin/src/$x" "assets/core/darwin/$x"; done
```

Or on Linux,

```bash
for x in zcoind zcoin-tx zcoin-cli; do ln -s "$PWD/zcoin/src/$x" "assets/core/linux/$x"; done
```

#### Updating zcoind

To update `zcoind`, simply run `git pull` in the `zcoind` directory, and run `./autogen.sh`, `./configure`, and `make`
with the arguments you previously used following your platform-specific build instructions.

## Installing npm Packages

To install dependencies for the client itself, run

```bash
npm install
```

## Installing Electron

You must also install [Electron](https://electronjs.org/). We're currently developing on Electron version `3.0.8`.

## Starting zcoin-client

To run the development version of zcoin-client, simply run

```bash
npm run dev
```

### Debug Levels

By default, zcoin-client will log to console at level `info`. You can change this with the `ZCOIN_CLIENT_DEBUG_LEVEL`
environment variable. zcoin-client will additionally log all messages and exceptions to `userData/combined.log` in the
application data directory.

## Getting Assistance

If you need assistance with this project, you can join the official Zcoin Telegram group
[@zcoinproject](https://t.me/zcoinproject)
