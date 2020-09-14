import path from 'path';
import os from 'os';
import fs from 'fs';
import {assert} from 'chai';
import {Application} from 'spectron';
import electron from 'electron';
import {convertToCoin, convertToSatoshi} from "../src/lib/convert";
import {TransactionOutput} from "../src/daemon/zcoind";

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

if (!process.env.USE_EXISTING_WALLET_FOR_TEST) {
    describe('Regtest Setup', function (this: Mocha.Suite) {
        scaffold.bind(this)(true);

        it('opens a window', async function (this: This) {
            assert.equal(await this.app.client.getWindowCount(), 1);
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
            assert.equal(mnemonicWords.length, 24);

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
                    assert.equal(await wordElement.getText(), mnemonicWords[n]);
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
                    assert.equal(await wordElement.getText(), mnemonicWords[n]);
                }
            }

            await (await this.app.client.$('#go-back')).click();
            await (await this.app.client.$('.write-down-mnemonic')).waitForExist();

            const nonHiddenWordElementsAgain = await this.app.client.$$('.mnemonic-word');
            for (const [n, wordElement] of nonHiddenWordElementsAgain.entries()) {
                assert.equal(await wordElement.getText(), mnemonicWords[n]);
            }

            await (await this.app.client.$('#go-back')).click();
            await (await this.app.client.$('#recover-from-mnemonic')).waitForExist();
        });

        it('can recover from mnemonics', async function (this: This) {
            this.timeout(1000e3);

            let twelveMnemonicWords = ["nation","tip","mean","govern","tide","comic","figure","gift","upper","love","kitchen","dolphin"];

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

        it('generates XZC from the debug console', async function (this: This) {
            this.timeout(500e3);
            this.slow(100e3);

            await (await this.app.client.$('a[href="#/debugconsole"]')).click();

            await this.app.client.keys([..."generate 500".split(''), "Enter"]);
            await this.app.client.waitUntil(
                async () => (await (await this.app.client.$('#current-input')).getText()) === '',
                {timeout: 250e3}
            );

            await this.app.client.waitUntilTextExists('#available-xzc', '16843');
            await this.app.client.waitUntilTextExists('#pending-xzc', '4300');
        });
    });
}

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(false);

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

        let originalReceiveAddress = await receiveAddressElement.getText();
        await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generatetoaddress 1 ${originalReceiveAddress}').then(arguments[0])`, []);
        await this.app.client.waitUntil(async () => (await receiveAddressElement.getText()) !== originalReceiveAddress);
    });

    it('suggests anonymization', async function (this: This) {
        this.timeout(10e3);

        await this.app.client.executeScript("$store.dispatch('Settings/SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN', 100)", []);

        const reviewMintSuggestionsButton = await this.app.client.$('#review-auto-mint-suggestions');
        await reviewMintSuggestionsButton.waitForExist();
        await reviewMintSuggestionsButton.click();

        await (await this.app.client.$('.denomination-selector')).waitForExist();
        const suggestions = await Promise.all(
            (await this.app.client.$$('.denomination-value'))
                .map(async el => {
                    const denomination = Number((await el.getAttribute('id')).match(/^denomination-(\d+)-value$/)[1]);
                    const value = Number(await el.getText());

                    return [denomination, value];
                })
        );

        let totalSuggested = 0;
        let totalMints = 0;
        for (const [denomination, value] of suggestions) {
            totalMints += value;
            totalSuggested += denomination * value;
        }

        const MINT_FEE = 0.001e8;
        const availableForAnonymization = convertToSatoshi(
            (await (await this.app.client.$('#available-xzc')).getText())
            .split(' ')
            [0]
        );
        assert.approximately(totalSuggested + totalMints * MINT_FEE, availableForAnonymization, 0.05e8);

        // Turn off mint suggestions.
        await this.app.client.executeAsyncScript("$daemon.legacyRpc('generate 1').then(arguments[0])", []);
        await reviewMintSuggestionsButton.waitForExist();
        await this.app.client.executeScript("$store.dispatch('Settings/SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN', 0)", []);
        // There is a bug in WebdriverIO that makes it difficult to check if an element has disappeared.
        await new Promise(r => setTimeout(r, 1000));
        assert.isFalse(await reviewMintSuggestionsButton.isDisplayed());
    });

    it('sends and receives a public payment', async function (this: This) {
        this.timeout(60e3);
        this.slow(30e3);

        let nonce = String(Math.random());
        let receiveAddress = await this.app.client.executeAsyncScript(`$daemon.getUnusedAddress().then(arguments[0])`, []);

        await (await this.app.client.$('a[href="#/send/public')).click();
        await (await this.app.client.$('.send-zcoin-form')).waitForExist();

        const sendButton = await this.app.client.$('#send-button');
        const label = await this.app.client.$('#label')
        const address = await this.app.client.$('#address');
        const amount = await this.app.client.$('#amount');

        await label.setValue(nonce);
        await address.setValue(receiveAddress);
        await amount.setValue('1');
        // Using waitForClickable() causes a weird bug where the entire page moves out of frame.
        await sendButton.waitForEnabled();

        await amount.setValue('0.0000000001');
        await sendButton.waitForEnabled({reverse: true});
        // There is a WebdriverIO bug where the old value is not cleared if we're changed too quickly.
        await new Promise(r => setTimeout(r, 100));
        await amount.setValue('1');
        await sendButton.waitForEnabled();

        await amount.setValue('99999999999999');
        await sendButton.waitForEnabled({reverse: true});
        // There is a WebdriverIO bug where the old value is not cleared if we're changed too quickly.
        await new Promise(r => setTimeout(r, 100));
        await amount.setValue('1');
        await sendButton.waitForEnabled();

        await address.setValue('invalid-address');
        await sendButton.waitForEnabled({reverse: true});
        // There is a WebdriverIO bug where the old value is not cleared if we're changed too quickly.
        await new Promise(r => setTimeout(r, 100));
        await address.setValue(receiveAddress);
        await sendButton.waitForEnabled();

        await sendButton.click();

        const cancelButton = await this.app.client.$('#cancel-button');
        await cancelButton.waitForEnabled();
        await cancelButton.click();

        await sendButton.waitForEnabled();
        await sendButton.click();

        const confirmButton = await this.app.client.$('#confirm-button');
        await confirmButton.waitForEnabled();
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

        // - The new transaction MUST be the first element in the list, which is only guaranteed if it is the first
        // transaction to occur after a block is generated.
        // - The type signature of timeout on waitUntilTextExists is incorrect.
        await this.app.client.waitUntilTextExists('.send-label', nonce, <any>{timeout: 10e3});
        await (await this.app.client.$('span.ok.is-incoming')).waitForExist();

        const tx: TransactionOutput = await this.app.client.executeScript(
            "return Object.values($store.getters['Transactions/transactions']).find(tx => tx.label === arguments[0] && tx.category === 'send' && !tx.isChange)",
            [nonce]
        );
        assert.equal(tx.fee + tx.amount, 1e8);
    });

    it('sends with a custom tx fee not subtracted from amount', async function (this: This) {
        this.timeout(30e3);
        this.slow(20e3);

        await this.app.client.executeAsyncScript("$daemon.legacyRpc('generate 1').then(arguments[0])", []);

        const nonce = String(Math.random());

        await (await this.app.client.$('a[href="#/send/public')).click();
        await (await this.app.client.$('.send-zcoin-form')).waitForExist();

        await (await this.app.client.$('#label')).setValue(nonce);
        await (await this.app.client.$('#address')).setValue('TAczBFWtiP8mNstdLn1Z383z51rZ1vHk5N');
        await (await this.app.client.$('#amount')).setValue('1');
        await (await this.app.client.$('#subtract-fee-from-amount-checkbox')).click();
        await (await this.app.client.$('#use-custom-fee-checkbox')).click();
        // There is a bug in WebdriverIO where the default text will not be erased, so this will end up as a 1111
        // satoshi fee. The test logic will work whether or not that bug is fixed.
        await (await this.app.client.$('#custom-fee')).setValue('111');

        const sendButton = await this.app.client.$('#send-button');
        // There is a WebdriverIO bug where this call takes a couple seconds to complete after the element is enabled.
        await sendButton.waitForEnabled();
        sendButton.click();

        const confirmButton = await this.app.client.$('#confirm-button');
        await confirmButton.waitForEnabled();
        await confirmButton.click();

        const passphraseInput = await this.app.client.$('#passphrase');
        await passphraseInput.waitForExist();
        await passphraseInput.setValue(passphrase);

        await (await this.app.client.$('#confirm-passphrase-send-button')).click();

        // The type signature of waitUntilTextExists is incorrect.
        await this.app.client.waitUntilTextExists('.send-label', nonce, <any>{timeout: 10e3});

        const tx: TransactionOutput = await this.app.client.executeScript(
            "return Object.values($store.getters['Transactions/transactions']).find(tx => tx.label === arguments[0] && !tx.isChange)",
            [nonce]
        );
        assert.isAtLeast(tx.fee, 111);
        assert.equal(tx.amount, 1e8);
    });

    it('anonymizes XZC', async function (this: This) {
        this.timeout(40e3);
        this.slow(20e3);

        // Make sure we have enough coins to anonymize.
        await this.app.client.executeAsyncScript("$daemon.legacyRpc('generate 10').then(arguments[0])", []);
        // TODO: It's easiest, if a bit racy, to just use a setTimeout to make sure the balance is updated, as we don't
        //  know what it should be, and it's a PITA to figure it out. It's also necessary for our balance to stop
        //  changing before we click on /anonymize, so the timeout here should be suitably long.
        await new Promise(r => setTimeout(r, 2e3));

        await (await this.app.client.$('a[href="#/anonymize')).click();
        await (await this.app.client.$('.mint-zerocoin')).waitForExist();

        for (const denomination of [100e8, 25e8, 10e8, 1e8, 0.5e8, 0.1e8, 0.05e8]) {
            await (await this.app.client.$(`#increase-${denomination}-button`)).click();
            await (await this.app.client.$(`#decrease-${denomination}-button`)).click();
            await (await this.app.client.$(`#increase-${denomination}-button`)).click();
        }

        const total = convertToSatoshi(await (await this.app.client.$('.amount > .value')).getText());
        assert.equal(total, 136.657e8);

        await (await this.app.client.$('#autoMintAmount')).setValue('137');
        await (await this.app.client.$('.automint-button')).click();
        // Autominting is implemented in a hackish way so just using a timer is easiest.
        await new Promise(r => setTimeout(r, 500));

        const total2 = convertToSatoshi(await (await this.app.client.$('.amount > .value')).getText());
        assert.equal(total2, 137.005e8)

        const anonymizeNowButton = await this.app.client.$('#anonymize-now-button');
        const confirmButton = await this.app.client.$('#confirm-button');
        const cancelButton = await this.app.client.$('#cancel-button');
        const passphraseInput = await this.app.client.$('#passphrase');
        const mintButton = await this.app.client.$('#mint-button');

        await anonymizeNowButton.waitForEnabled();
        await anonymizeNowButton.click();

        await confirmButton.waitForEnabled();
        await confirmButton.click();

        await cancelButton.click();

        await anonymizeNowButton.click()

        await confirmButton.waitForEnabled();
        await confirmButton.click();

        await passphraseInput.setValue(passphrase);
        await mintButton.click();

        // pendingPrivateXzc will consist solely of what was minted in this function due to the blocks we minted above.
        const pendingPrivateXzcElement = await this.app.client.$('#pending-private-xzc');
        await pendingPrivateXzcElement.waitForDisplayed();
        const pendingPrivateXzc = Number((await pendingPrivateXzcElement.getText()).match(/\d+/)[0]);
        assert.equal(pendingPrivateXzc, 137);
    });
});