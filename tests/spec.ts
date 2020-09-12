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
let twelveMnemonicWords = ["nation","tip","mean","govern","tide","comic","figure","gift","upper","love","kitchen","dolphin"];
let mnemonicWords: string[];

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

async function generateBlocks(self: This, blocks: number) {
    await (await self.app.client.$('a[href="#/debugconsole"]')).click();

    await self.app.client.keys([...`generate ${blocks}`.split(''), "Enter"]);
    await self.app.client.waitUntil(async () =>
        (await (await self.app.client.$('#current-input')).getText()) === ''
    , {timeout: Math.max(2000, blocks*500)});
}

describe('Regtest Setup', function (this: Mocha.Suite) {
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

        const defaultDataDirLocation = await (await this.app.client.$('#datadir-value')).getText();
        const dataDirLocation = path.join(os.tmpdir(), `zcoin-client-test-${Math.floor(Math.random() * 1e16)}`);

        fs.mkdirSync(dataDirLocation);

        // Creating a new directory is in normal usage taken care of by the file selection dialog, which can't be automated.
        const setDataDirJS = `e = new Event('set-data-dir'); e.dataDir = ${JSON.stringify(dataDirLocation)}; document.dispatchEvent(e)`;

        // Set the data dir to the test location.
        await this.app.webContents.executeJavaScript(setDataDirJS);
        await this.app.client.waitUntilTextExists('#datadir-value', dataDirLocation);

        // Test resetting the data dir.
        await (await this.app.client.$('#reset-data-dir')).click();
        await this.app.client.waitUntilTextExists('#datadir-value', defaultDataDirLocation);


        // Set it back to the real (test) location.
        await this.app.webContents.executeJavaScript(setDataDirJS);
        await this.app.client.waitUntilTextExists('#datadir-value', dataDirLocation);


        await (await this.app.client.$('#continue-setup')).click();
        await (await this.app.client.$('#create-new-wallet')).waitForExist();
    });

    it('correctly displays and confirms mnemonic', async function (this: This) {
        this.timeout(5000e3);
        this.slow(5e3);

        await (await this.app.client.$('#create-new-wallet')).click();
        await (await this.app.client.$('.write-down-mnemonic')).waitForExist();

        mnemonicWords = await Promise.all((await this.app.client.$$('.mnemonic-word')).map(e => e.getText()));
        expect(mnemonicWords.length).to.equal(24);

        await (await this.app.client.$('#confirm-button')).click();
        await (await this.app.client.$('.confirm-mnemonic')).waitForExist();

        const wordElements = await this.app.client.$$('.mnemonic-word');
        const submitButton = await this.app.client.$('#submit-button');
        let lastHiddenIndex: number;

        for (const [n, wordElement] of wordElements.entries()) {
            const classNames = <string>await wordElement.getAttribute('class');
            if (classNames.includes('hidden')) {
                lastHiddenIndex = n;
                await wordElement.setValue(mnemonicWords[n]);
            } else {
                expect(await wordElement.getText()).to.equal(mnemonicWords[n]);
            }
        }

        await submitButton.waitForClickable();

        // Test incorrect words.
        await wordElements[lastHiddenIndex].setValue('invalid-word');
        await submitButton.waitForClickable({reverse: true});

        // Set it back to the valid word.
        await wordElements[lastHiddenIndex].setValue(mnemonicWords[lastHiddenIndex]);
        await submitButton.waitForClickable();

        await submitButton.click();

        await (await this.app.client.$('#passphrase')).waitForExist();
    });

    it('goes back from the passphrase step', async function (this: This) {
        await (await this.app.client.$('#go-back')).click();
        await (await this.app.client.$('.confirm-mnemonic')).waitForExist();

        const wordElementsAgain = await this.app.client.$$('.mnemonic-word');
        for (const [n, wordElement] of wordElementsAgain.entries()) {
            const classNames = <string>await wordElement.getAttribute('class');
            if (!classNames.includes('hidden')) {
                expect(await wordElement.getText()).to.equal(mnemonicWords[n]);
            }
        }

        await (await this.app.client.$('#go-back')).click();
        await (await this.app.client.$('.write-down-mnemonic')).waitForExist();

        const nonHiddenWordElementsAgain = await this.app.client.$$('.mnemonic-word');
        for (const [n, wordElement] of nonHiddenWordElementsAgain.entries()) {
            expect(await wordElement.getText()).to.equal(mnemonicWords[n]);
        }

        await (await this.app.client.$('#go-back')).click();
        await (await this.app.client.$('#recover-from-mnemonic')).waitForExist();
    });

    it('can recover from mnemonics', async function (this: This) {
        this.timeout(1000e3);

        await (await this.app.client.$('#recover-from-mnemonic')).click();

        const submitButton = await this.app.client.$('#submit-button');

        await (await this.app.client.$('input[value="12"]')).click();
        // FIXME: There is a bug in WebdriverIO.Element.waitForExists({reverse: true}), so we just do a short fixed wait
        //        to be sure everything is updated.
        await new Promise(r => setTimeout(r, 20));

        const twelveMnemonicWordElements = await this.app.client.$$('input.mnemonic-word');
        // PROTIP: Using Object.entries() on the result of $$() doesn't work.
        for (const [n, word] of Object.entries(twelveMnemonicWords)) {
            await twelveMnemonicWordElements[n].setValue(word);
        }

        await submitButton.waitForClickable();

        twelveMnemonicWordElements[0].setValue('invalid-word');
        await submitButton.waitForClickable({reverse: true});

        await (await this.app.client.$('input[value="24"]')).click();
        await new Promise(r => setTimeout(r, 20)); // FIXME: see above

        const twentyFourMnemonicWordElements = await this.app.client.$$('input.mnemonic-word');
        for (const [n, word] of Object.entries(mnemonicWords)) {
            await twentyFourMnemonicWordElements[n].setValue(word);
        }

        await submitButton.waitForClickable();

        twentyFourMnemonicWordElements[0].setValue('invalid-word');
        await submitButton.waitForClickable({reverse: true});

        twentyFourMnemonicWordElements[0].setValue(mnemonicWords[0]);
        await submitButton.waitForClickable();

        await submitButton.click();
        await (await this.app.client.$('#passphrase')).waitForExist();
    });

    it('locks the wallet', async function (this: This) {
        this.timeout(60e3);
        this.slow(20e3);

        const submitButton = await this.app.client.$('#submit-button');

        await (await this.app.client.$('#passphrase')).setValue(passphrase);
        await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase);
        await submitButton.waitForClickable();

        await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase + 'invalid');
        await submitButton.waitForClickable({reverse: true})

        await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase);
        await submitButton.waitForClickable();

        await submitButton.click();

        await (await this.app.client.$('.tx-page')).waitForExist({timeout: 60e3});
    });

    it('generates XZC', async function (this: This) {
        this.timeout(500e3);
        this.slow(100e3);

        await generateBlocks(this, 500);

        await this.app.client.waitUntilTextExists('#available-xzc', '16843');
        await this.app.client.waitUntilTextExists('#pending-xzc', '4300');
    });
});

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(false);

    let nonce = String(Math.random());
    let receiveAddress: string;

    it('loads our existing wallet', async function (this: This) {
        this.timeout(20e3);
        this.slow(20e3);

        // Check that there are existing payments.
        const paymentStatusElement = await this.app.client.$('.vuetable-td-component-transaction-status');
        await paymentStatusElement.waitForExist({timeout: 20e3});
    });

    it('displays and updates the receiving address', async function (this: This) {
        const receiveAddressElement = await this.app.client.$('#receive-address');
        await receiveAddressElement.waitForExist();

        receiveAddress = await receiveAddressElement.getText();
        await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generatetoaddress 1 ${receiveAddress}').then(arguments[0])`, []);
        await this.app.client.waitUntil(async () => (await receiveAddressElement.getText()) !== receiveAddress);
        receiveAddress = await receiveAddressElement.getText();
    });

    it('sends and receives a public payment', async function (this: This) {
        this.timeout(60e3);
        this.slow(30e3);

        await (await this.app.client.$('a[href="#/send/public')).click();
        await (await this.app.client.$('.send-zcoin-form')).waitForExist();

        const sendButton = await this.app.client.$('#send-button');
        const label = await this.app.client.$('#label')
        const address = await this.app.client.$('#address');
        const amount = await this.app.client.$('#amount');

        await address.setValue(receiveAddress);
        await amount.setValue('1');
        await sendButton.waitForClickable();

        await label.setValue(nonce);

        await amount.setValue('0.0000000001');
        await sendButton.waitForClickable({reverse: true});
        await amount.setValue('1');
        await sendButton.waitForClickable();

        await amount.setValue('99999999999999');
        await sendButton.waitForClickable({reverse: true});
        await amount.setValue('1');
        await sendButton.waitForClickable();

        await address.setValue('invalid-address');
        await sendButton.waitForClickable({reverse: true});
        await address.setValue(receiveAddress);
        await sendButton.waitForClickable();

        await sendButton.click();

        const cancelButton = await this.app.client.$('#cancel-button');
        await cancelButton.waitForClickable();
        await cancelButton.click();

        await sendButton.waitForClickable();
        await sendButton.click();

        const confirmButton = await this.app.client.$('#confirm-button');
        await confirmButton.waitForClickable();
        await confirmButton.click();

        const passphraseInput = await this.app.client.$('#passphrase');
        await passphraseInput.waitForExist();
        await passphraseInput.setValue(passphrase + '-invalid');

        const realSendButton = await this.app.client.$('#confirm-passphrase-send-button');
        await realSendButton.click();

        const tryAgainButton = await this.app.client.$('#try-again-button');
        await tryAgainButton.waitForExist();
        await tryAgainButton.click();

        await passphraseInput.waitForExist();
        await passphraseInput.setValue(passphrase);
        await realSendButton.click();

        // The new transaction MUST be the first element in the list, which is only guaranteed if it is the first
        // transaction to occur after a block is generated.
        await this.app.client.waitUntilTextExists('.send-label', nonce, 10e3);
        await (await this.app.client.$('span.ok.is-incoming')).waitForExist();
    });
});