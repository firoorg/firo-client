import Big from 'big.js';
import path from 'path';
import os from 'os';
import fs from 'fs';
import {assert} from 'chai';
import {Application} from 'spectron';
import electron from 'electron';
import {convertToCoin, convertToSatoshi} from "../src/lib/convert";
import {TransactionOutput} from "../src/daemon/firod";

interface This extends Mocha.Context {
    app: Application
}

if (process.env.BUILD_FIRO_CLIENT !== 'false') {
    before(async function () {
        this.timeout(1000e3); // Make sure we have enough time to build our app.
        await require('../electron-vue/build');
    });
}

const passphrase = 'sloth';
let mnemonicWords: string[];

function scaffold(this: Mocha.Suite, reinitializeFiroClient: boolean) {
    this.timeout(5e3);
    this.slow(500);

    this.beforeAll(async function (this: This) {
        this.timeout(10e3);

        this.app = new Application({
            path: <any>electron, // the type annotation for path is incorrect
            args: [path.join(__dirname, '..', 'dist', 'electron', 'main.js'), '--test-print'],
            env: {
                FIRO_CLIENT_TEST: 'true',
                REINITIALIZE_FIRO_CLIENT: String(reinitializeFiroClient)
            }
        });

        console.info('Starting Firo Client...');
        await this.app.start();
        await this.app.client.waitUntilWindowLoaded();
        console.info('Firo Client started.');

        // This is required due to a Spectron bug: https://github.com/electron-userland/spectron/issues/763
        this.app.client.setTimeout({implicit: 0});
    });

    this.afterEach(async function (this: This) {
        // Getting these will clear the logs.
        const mainLogs = await this.app.client.getMainProcessLogs();
        const rendererLogs = await this.app.client.getRenderProcessLogs();

        if (this.currentTest.state === 'failed') {
            console.error('Main process logs:');
            console.error(mainLogs.join("\n"));
            console.error('Renderer process logs:');
            console.error(rendererLogs.join("\n"));
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
            const startButton = await this.app.client.$('button');
            await startButton.waitForExist();
            await startButton.click();

            await (await this.app.client.$('select')).waitForExist();
        });

        it('allows selecting blockchain location and network', async function (this: This) {
            this.slow(1e3);

            await (await this.app.client.$('select')).selectByAttribute('value', 'regtest');

            const defaultDataDirLocation = await (await this.app.client.$('#datadir-value')).getText();
            // os.tmpdir() isn't actually unique. :-/
            const dataDirLocation = path.join(os.tmpdir(), `firo-client-test-${Math.floor(Math.random() * 1e16)}`);

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


            await (await this.app.client.$('button')).click();
            await (await this.app.client.$('.select-create-or-restore')).waitForExist();
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
            const okButton = await this.app.client.$('#ok-button');
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

            await okButton.waitForClickable();

            // Test incorrect words.
            await wordElements[lastHiddenIndex].setValue('invalid-word');
            await okButton.waitForClickable({reverse: true});

            // Set it back to the valid word.
            await wordElements[lastHiddenIndex].setValue(mnemonicWords[lastHiddenIndex]);
            await okButton.waitForClickable();

            await okButton.click();

            await (await this.app.client.$('#passphrase')).waitForExist();
        });

        it('goes back from the passphrase step', async function (this: This) {
            await (await this.app.client.$('#back-button')).click();
            await (await this.app.client.$('.confirm-mnemonic')).waitForExist();

            const wordElementsAgain = await this.app.client.$$('.mnemonic-word');
            for (const [n, wordElement] of wordElementsAgain.entries()) {
                const classNames = <string>await wordElement.getAttribute('class');
                if (!classNames.includes('hidden')) {
                    assert.equal(await wordElement.getText(), mnemonicWords[n]);
                }
            }

            await (await this.app.client.$('#back-button')).click();
            await (await this.app.client.$('.write-down-mnemonic')).waitForExist();

            const nonHiddenWordElementsAgain = await this.app.client.$$('.mnemonic-word');
            for (const [n, wordElement] of nonHiddenWordElementsAgain.entries()) {
                assert.equal(await wordElement.getText(), mnemonicWords[n]);
            }

            await (await this.app.client.$('#back-button')).click();
            await (await this.app.client.$('#recover-from-mnemonic')).waitForExist();
        });

        it('can recover from mnemonics', async function (this: This) {
            this.timeout(1000e3);

            let twelveMnemonicWords = ["nation","tip","mean","govern","tide","comic","figure","gift","upper","love","kitchen","dolphin"];

            await (await this.app.client.$('#recover-from-mnemonic')).click();

            const submitButton = await this.app.client.$('#ok-button');

            await (await this.app.client.$('input[value="12"]')).click();
            await (await this.app.client.$('#mnemonic-word-13')).waitForExist({reverse: true});

            const twelveMnemonicWordElements = await this.app.client.$$('input.mnemonic-word');
            for (const [n, word] of Object.entries(twelveMnemonicWords)) {
                await twelveMnemonicWordElements[n].setValue(word);
            }

            await submitButton.waitForClickable();

            twelveMnemonicWordElements[0].setValue('invalid-word');
            await submitButton.waitForClickable({reverse: true});

            await (await this.app.client.$('input[value="24"]')).click();
            await (await this.app.client.$('#mnemonic-word-13')).waitForExist();

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

            const submitButton = await this.app.client.$('#ok-button');

            await (await this.app.client.$('#passphrase')).setValue(passphrase);
            await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase);
            await submitButton.waitForClickable();

            await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase + 'invalid');
            await submitButton.waitForClickable({reverse: true})

            await (await this.app.client.$('#confirm-passphrase')).setValue(passphrase);
            await submitButton.waitForClickable();

            await submitButton.click();

            await (await this.app.client.$('.transactions-page')).waitForExist({timeout: 60e3});
        });

        it('generates FIRO from the debug console', async function (this: This) {
            this.timeout(500e3);
            this.slow(100e3);

            await (await this.app.client.$('a[href="#/debugconsole"]')).click();

            await this.app.client.keys([..."generate 1000".split(''), "Enter"]);
            await this.app.client.waitUntil(
                async () => (await (await this.app.client.$('#current-input')).getText()) === '',
                {timeout: 500e3}
            );
        });

        it('has the correct balance after generating FIRO from the debug console', async function (this: This) {
            await this.app.client.waitUntilTextExists('.public .amount', '38343');
            await this.app.client.waitUntilTextExists('.pending .amount', '4300');
        });
    });
}

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(false);

    this.beforeAll('waits to load our wallet', async function (this: This) {
        this.timeout(20e3);
        this.slow(20e3);

        // Check that there are existing payments.
        const paymentStatusElement = await this.app.client.$('td');
        await paymentStatusElement.waitForExist({timeout: 20e3});
    });

    this.beforeAll('generates Firo if not enough is available', async function (this: This) {
        this.timeout(100e3);
        this.slow(100e3);

        // This value doesn't actually _have_ to be above 1 if we're testing with an existing firod, but in a test
        // environment we've probably made some error and it's best to check for that now.
        const privateBalanceElement = await this.app.client.$('.balance .private .amount');
        const publicBalanceElement = await this.app.client.$('.balance .public .amount');

        if (!await publicBalanceElement.isExisting() || Number(await publicBalanceElement.getText()) < 40) {
            // Probably we're mining all the blocks ourselves, and generating just one block will create a balance.
            await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generate 2').then(arguments[0])`, []);

            try {
                await publicBalanceElement.waitForExist({timeout: 1e3});
                await this.app.client.waitUntil(async () => Number(await publicBalanceElement.getText()) >= 40, {timeout: 1e3});
            } catch {
                // If generating 2 blocks failed to create a balance, generate 100 more so that we'll definitely have
                // received a block reward.
                await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generate 100').then(arguments[0])`, []);
                await publicBalanceElement.waitForExist({timeout: 1e3});
                await this.app.client.waitUntil(async () => Number(await publicBalanceElement.getText()) >= 40, {timeout: 1e3});
            }
        }

        if (Number(await privateBalanceElement.getText()) < 20) {
            for (const cmd of [`walletpassphrase ${passphrase} 5`, 'mintlelantus 20', 'generate 6']) {
                await this.app.client.executeAsyncScript('$daemon.legacyRpc(arguments[0]).then(arguments[1])', [cmd]);
            }
            await this.app.client.waitUntil(async () => Number(await privateBalanceElement.getText()) >= 20, {timeout: 1e3});
        }
    });

    it('displays and updates the receiving address', async function (this: This) {
        this.timeout(10e3);

        await (await this.app.client.$('a[href="#/receive"]')).click();

        const receiveAddressElement = await this.app.client.$('a.address');
        await receiveAddressElement.waitForExist();

        let originalReceiveAddress = await receiveAddressElement.getText();
        await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generatetoaddress 1 ${originalReceiveAddress}').then(arguments[0])`, []);
        await this.app.client.waitUntil(async () => (await receiveAddressElement.getText()) !== originalReceiveAddress);
    });

    it('sends and receives a private payment', async function (this: This) {
        this.timeout(20e3);

        const sendAddress = await this.app.client.executeAsyncScript(`$daemon.getUnusedAddress().then(arguments[0])`, []);
        const satoshiAmountToSend = Math.floor(1e8 * Math.random());
        const amountToSend = convertToCoin(satoshiAmountToSend);

        await (await this.app.client.$('a[href="#/send')).click();
        await (await this.app.client.$('#send-page')).waitForExist();

        const sendButton = await this.app.client.$('#send-button');
        const label = await this.app.client.$('#label')
        const address = await this.app.client.$('#address');
        const amount = await this.app.client.$('#amount');

        // Set up a valid form.

        await address.setValue(sendAddress);
        await amount.setValue(amountToSend);
        await sendButton.waitForEnabled();

        // Check validations

        await amount.setValue('0.0000000001');
        await sendButton.waitForEnabled({reverse: true});
        // There is a WebdriverIO bug where the old value is not cleared if we're changed too quickly.
        await amount.clearValue();
        await amount.setValue(amountToSend);
        await sendButton.waitForEnabled();

        await amount.setValue('99999999999999');
        await sendButton.waitForEnabled({reverse: true});
        await amount.setValue(amountToSend);
        await sendButton.waitForEnabled();

        await address.setValue('invalid-address');
        await sendButton.waitForEnabled({reverse: true});
        // There is a WebdriverIO bug where the old value is not cleared if we're changed too quickly.
        await address.clearValue();
        await address.setValue(sendAddress);
        await sendButton.waitForEnabled();

        await sendButton.click();

        const cancelButton = await this.app.client.$('button.cancel');
        await cancelButton.waitForExist();
        await cancelButton.click();
        await cancelButton.waitForExist({reverse: true});

        await sendButton.click();

        const confirmButton = await this.app.client.$('button.confirm');
        await confirmButton.waitForExist();
        await confirmButton.click();

        const passphraseInput = await this.app.client.$('input[type="password"]');
        await passphraseInput.waitForExist();
        await passphraseInput.setValue(passphrase + '-invalid');

        const realSendButton = await this.app.client.$('button.confirm');
        await realSendButton.click();

        await (await this.app.client.$('.passphrase-input .error')).waitForExist();

        const passphraseInput2 = await this.app.client.$('input[type="password"]');
        await passphraseInput2.setValue(passphrase);

        const realSendButton2 = await this.app.client.$('button.confirm');
        await realSendButton2.click();

        const waiting = await this.app.client.$('#wait-overlay');
        await waiting.waitForExist();
        await waiting.waitForExist({reverse: true, timeout: 10e3});

        // Make sure fields are cleared.
        assert.isEmpty(await label.getValue());
        assert.isEmpty(await address.getValue());
        assert.isEmpty(await amount.getValue());

        await (await this.app.client.$('a[href="#/transactions')).click();

        // Give some time to make sure we've updated the store.
        await new Promise(r => setTimeout(r, 1000));

        const txOut: TransactionOutput = await this.app.client.executeScript(
            "return Object.values($store.getters['Transactions/transactions']).find(tx => tx.amount === arguments[0] && tx.category === 'spendOut' && !tx.isChange)",
            [satoshiAmountToSend]
        );
        assert.exists(txOut);

        const txIn: TransactionOutput = await this.app.client.executeScript(
            "return Object.values($store.getters['Transactions/transactions']).find(tx => tx.amount === arguments[0] && tx.category === 'spendIn' && !tx.isChange)",
            [satoshiAmountToSend]
        );
        assert.exists(txIn);

        // The type signature of timeout on waitUntilTextExists is incorrect.
        await this.app.client.waitUntilTextExists('.vuetable-td-component-amount .incoming', amountToSend, <any>{timeout: 10e3});
        await this.app.client.waitUntilTextExists('.vuetable-td-component-amount .outgoing', amountToSend, <any>{timeout: 10e3});
    });

    it('has private coin control entries that sum to the correct amount', async function (this: This) {
        const balance = Big(convertToSatoshi(await (await this.app.client.$('.balance .private .amount')).getText()));

        await (await this.app.client.$('a[href="#/send"]')).click();

        await (await this.app.client.$('#custom-inputs-button')).click();
        let sumOfInputs = Big(0);
        while (true) {
            sumOfInputs = (await Promise.all(
                (await this.app.client.$$('#popup .amount')).map(async e =>
                    Big(convertToSatoshi(await e.getText()))
                )
            )).reduce((a, x) => a.add(x), sumOfInputs);

            const nextPageLink = await this.app.client.$('#popup .next-page-link:not(.disabled)');
            if (!await nextPageLink.isExisting()) break;
            await nextPageLink.click();
        }

        try {
            assert.isTrue(sumOfInputs.eq(balance), `got ${sumOfInputs}, expected ${balance}`);
        } finally {
            await (await this.app.client.$('#close-popup-button')).click();
        }
    });

    it('has public coin control entries that sum to the correct amount', async function (this: This) {
        const balanceElement = await this.app.client.$('.balance .public .amount');
        let balance = 0;
        if (await balanceElement.isExisting()) {
            balance = Big(convertToSatoshi(await balanceElement.getText()));
        }

        await (await this.app.client.$('a[href="#/send"]')).click();
        await (await this.app.client.$('.private-public-balance .toggle-switch')).click();

        await (await this.app.client.$('#custom-inputs-button')).click();
        let sumOfInputs = Big(0);
        while (true) {
            sumOfInputs = (await Promise.all(
                (await this.app.client.$$('#popup .amount')).map(async e =>
                    Big(convertToSatoshi(await e.getText()))
                )
            )).reduce((a, x) => a.add(x), sumOfInputs);

            const nextPageLink = await this.app.client.$('#popup .next-page-link:not(.disabled)');
            if (!await nextPageLink.isExisting()) break;
            await nextPageLink.click();
        }

        try {
            assert.isTrue(sumOfInputs.eq(balance), `got ${sumOfInputs}, expected ${balance}`);
        } finally {
            await (await this.app.client.$('#close-popup-button')).click();
        }
    });

    it('navigates in the debug console', async function (this: This) {
        await (await this.app.client.$('a[href="#/debugconsole"]')).click();

        const currentInput = await this.app.client.$('#current-input')

        await this.app.client.keys([..."garbage-input-1".split(''), "Enter"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === '');

        await this.app.client.keys([..."garbage-input-2".split(''), "Enter"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === '');

        await this.app.client.keys(["ArrowUp"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === 'garbage-input-2');

        await this.app.client.keys(["ArrowUp"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === 'garbage-input-1');

        await this.app.client.keys(["ArrowDown"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === 'garbage-input-2');

        await this.app.client.keys(["ArrowDown"]);
        await this.app.client.waitUntil(async () => (await currentInput.getText()) === '');
    });

    it('properly sends debug commands', async function (this: This) {
        await (await this.app.client.$('a[href="#/debugconsole"]')).click();

        const currentInput = await this.app.client.$('#current-input');

        for (const [cmd, expectedOutput] of [['getinfo', '"relayfee"'], ['help move', 'Move 0.01 FIRO from the default account']]) {
            await this.app.client.keys([...cmd.split(''), "Enter"]);
            await this.app.client.waitUntil(async () => (await currentInput.getText()) === '');

            let hasResponse = false;
            for (const e of await this.app.client.$$('.output')) {
                if ((await e.getText()).includes(expectedOutput)) {
                    hasResponse = true;
                    break;
                }
            }
            assert.isTrue(hasResponse, `expected output of ${cmd} has not appeared in the debug console`);
        }
    });
});