import path from 'path';
import os from 'os';
import fs from 'fs';
import {expect} from 'chai';
import {Application} from 'spectron';
import electron from 'electron';

interface This extends Mocha.Context {
    app: Application
}

if (process.env.BUILD_ZCOIN_CLIENT !== 'false') {
    before(async function () {
        this.timeout(1000e3); // Make sure we have enough time to build our app.
        await require('../electron-vue/build');
    });
}

const passphrase = 'passphrase';

function scaffold(this: Mocha.Suite, reinitializeZcoinClient: boolean) {
    this.timeout(5e3);
    this.slow(500);

    this.beforeAll(async function (this: This) {
        this.timeout(10e3);

        this.app = new Application({
            path: <any>electron, // the type annotation for path is incorrect
            args: [path.join(__dirname, '..', 'dist', 'electron', 'main.js'), '--test-print'],
            env: {
                ZCOIN_CLIENT_TEST: 'true',
                REINITIALIZE_ZCOIN_CLIENT: String(reinitializeZcoinClient)
            }
        });

        console.info('Starting Zcoin Client...');
        await this.app.start();
        await this.app.client.waitUntilWindowLoaded();
        console.info('Zcoin Client started.');
    });

    this.afterEach(async function (this: This) {
        // Getting these will clear the logs.
        const mainLogs = await this.app.client.getMainProcessLogs();
        const rendererLogs = await this.app.client.getRenderProcessLogs();

        if (this.currentTest.state === 'failed') {
            console.error('Main process logs:');
            console.error(mainLogs);
            console.error('Renderer process logs:');
            console.error(rendererLogs);
        }
    });

    this.afterAll(async function (this: This) {
        this.timeout(10e3);
        await this.app.stop();
    });
}

describe('Regtest with New Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(true);

    it('opens a window', async function (this: This) {
        expect(await this.app.client.getWindowCount()).to.equal(1);
    });

    it('starts', async function (this: This) {
        const startButton = await this.app.client.$('.start-button');
        await startButton.waitForExist();
        await startButton.click();

        await (await this.app.client.$('#network-value')).waitForExist();
    });

    it('allows selecting blockchain location and network', async function (this: This) {
        this.slow(1e3);

        await (await this.app.client.$('#network-value')).selectByAttribute('value', 'regtest');

        // Set data directory.
        const dataDirLocation = path.join(os.tmpdir(), `zcoin-client-test-${Math.floor(Math.random() * 1e16)}`);
        // Creating a new directory is in normal usage taken care of by the file selection dialog.
        fs.mkdirSync(dataDirLocation);
        await this.app.webContents.executeJavaScript(`const e = new Event('set-data-dir'); e.dataDir = ${JSON.stringify(dataDirLocation)}; document.dispatchEvent(e)`);
        await this.app.client.waitUntilTextExists('#datadir-value', dataDirLocation);

        await (await this.app.client.$('#continue-setup')).click();
        await (await this.app.client.$('#create-new-wallet')).waitForExist();
    });

    it('correctly displays and confirms mnemonic', async function (this: This) {
        this.timeout(5e3);
        this.slow(5e3);

        await (await this.app.client.$('#create-new-wallet')).click();
        await (await this.app.client.$('.mnemonic-screen')).waitForExist();

        const words = [];
        for (let n = 0; n < 24; n++) {
            const wordElement = await this.app.client.$(`#mnemonic-word-${n}`);
            words.push(await wordElement.getText());
        }
        expect(words.length).to.equal(24);

        await (await this.app.client.$('#confirm-button')).click();


        await (await this.app.client.$('.mnemonic-word')).waitForExist();

        const wordElements = await this.app.client.$$('.mnemonic-word');
        for (const [n, wordElement] of wordElements.entries()) {
            const classNames = <string>await wordElement.getAttribute('class');
            if (classNames.includes('hidden')) {
                await wordElement.setValue(words[n]);
            } else {
                expect(await wordElement.getText()).to.equal(words[n]);
            }
        }

        const submitButton = await this.app.client.$('#submit-button');
        await submitButton.waitForClickable();
        await submitButton.click();

        await (await this.app.client.$('#passphrase')).waitForExist();
    });

    it('locks the wallet', async function (this: This) {
        this.timeout(60e3);
        this.slow(20e3);

        await (await this.app.client.$('#passphrase')).setValue(passphrase);
        await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase);

        const submitButton = await this.app.client.$('#submit-button');
        await submitButton.waitForClickable();
        await submitButton.click();

        await (await this.app.client.$('.tx-page')).waitForExist({timeout: 60e3});
    });

    it('generates XZC', async function (this: This) {
        this.timeout(500e3);
        this.slow(100e3);

        await (await this.app.client.$('a[href="#/debugconsole"]')).click();

        await this.app.client.keys([..."generate 500".split(''), "Enter"]);

        await this.app.client.waitUntilTextExists('#available-xzc', '16843', <any>{timeout: 500e3});
        await this.app.client.waitUntilTextExists('#pending-xzc', '4300');
    });
});

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(false);

    it('loads our existing wallet', async function (this: This) {
        this.timeout(20e3);
        this.slow(20e3);

        // Check that there are existing payments.
        const paymentStatusElement = await this.app.client.$('.vuetable-td-component-transaction-status');
        await paymentStatusElement.waitForExist({timeout: 20e3});
    });
});