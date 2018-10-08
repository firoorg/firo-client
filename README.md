# Zcoin Client

![](.github/github-zcoin-client-header.png)

Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui.

---

## Development

As the clients architecture is split up into two separate components both of them need to set up first.
The graphical interface is structurally decoupled from the core and communicates through an ZeroMQ API. This is the Repository of the interface only. Head over to https://github.com/zcoinofficial/zcoin/tree/client-api#dependencies where the daemon code lives and setup of dependencies is described.

### Zcoin Daemon

Nevertheless, we provide an easy to us script which pulls the official repo, builds `zcoind` and moves it into the right folders where the gui can pick it up inside this repo. Simply run the following, get a ☕️, and after a couple of minutes you should be good to go.

___NOTE:__ As the development on the Graphical Uer Interface is mainly done on MacOS the following script will not work on other operating systems – it is at least untested, PRs are welcome ;)._

```bash
# fetches core from github and compiles it on all cores
./fetch-and-build-zcoin-core.sh
``` 

### Graphical User Interface

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# serve with hot reload and append a ✅ to localized strings
npm run translate

# build electron application for production
npm run build
```

---

### Build for Production / Release

Make sure authentication is enabled in `zcoinofficial/zcoin`. The Client __enforces__ encrypted communication between the gui and `zcoind` and will be unable to connect otherwise. 

