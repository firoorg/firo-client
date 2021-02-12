import lodash from 'lodash';
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
    this.timeout(20e3);
    this.slow(5e3);

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

        // implicit: 0 is required due to a Spectron bug: https://github.com/electron-userland/spectron/issues/763
        // script: 200e3 is because we may call "generate 100"
        this.app.client.setTimeout({implicit: 0, script: 200e3});
    });

    this.beforeEach(async function (this: This) {
        console.log(`started: ${(new Date()).toISOString()}`);
    });

    this.afterEach(async function (this: This) {
        console.log(`finished: ${(new Date()).toISOString()}`);
    });

    this.afterAll(async function (this: This) {
        this.timeout(10e3);
        // Wait for a small bit to make sure we won't trigger a race condition in the daemon.
        await new Promise(r => setTimeout(r, 1e3));
        console.log((await this.app.client.getMainProcessLogs()).join('\n') + '\n');
        await this.app.stop();
    });
}

describe('Regtest Setup', function (this: Mocha.Suite) {
    scaffold.bind(this)(true);

    if (!process.env.TEST_WALLET_CREATION) {
        this.beforeAll(function (this: This) {
            this.skip();
        });
    }

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

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    scaffold.bind(this)(false);

    this.beforeAll('waits to load our wallet', async function (this: This) {
        this.timeout(100e3);
        this.slow(20e3);

        // Check that there are existing payments.
        const paymentStatusElement = await this.app.client.$('td');
        await paymentStatusElement.waitForExist({timeout: 100e3});
    });

    this.beforeAll('is using regtest', async function (this: This) {
        const badge = await this.app.client.$('.network-badge');
        assert.isTrue(await badge.isExisting());
        assert.equal(await badge.getText(), 'Regtest');
    });

    async function generateSufficientFiro(this: This) {
        this.timeout(200e3);
        this.slow(100e3);

        // This value doesn't actually _have_ to be above 1 if we're testing with an existing firod, but in a test
        // environment we've probably made some error and it's best to check for that now.
        const privateBalanceElement = await this.app.client.$('.balance .private .amount');
        const publicBalanceElement = await this.app.client.$('.balance .public .amount');

        while (!await publicBalanceElement.isExisting() || Number(await publicBalanceElement.getText()) < 40) {
            // Probably we're mining all the blocks ourselves.
            await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generate 1').then(arguments[0])`, []);
        }

        if (Number(await privateBalanceElement.getText()) < 20) {
            // At least 2 coins are required in the anonymity set before we can spend.
            for (const cmd of [`walletpassphrase ${passphrase} 5`, 'mintlelantus 10', 'mintlelantus 10', 'generate 6']) {
                await this.app.client.executeAsyncScript('$daemon.legacyRpc(arguments[0]).then(arguments[1])', [cmd]);
            }
            await this.app.client.waitUntil(async () => Number(await privateBalanceElement.getText()) >= 20, {timeout: 1e3});
        }
    }
    this.beforeEach('generates Firo if not enough is available', generateSufficientFiro);

    it('can change the passphrase', async function (this: This) {
        await (await this.app.client.$('a[href="#/settings"]')).click();

        const currentPassphraseElement = await this.app.client.$('#current-passphrase-input');
        const newPassphraseElement = await this.app.client.$('#new-passphrase-input');
        const confirmNewPassphaseElement = await this.app.client.$('#confirm-new-passphrase-input');
        const changePassphraseButton = await this.app.client.$('#change-passphrase-button');

        await currentPassphraseElement.setValue('invalid-passphrase');
        await newPassphraseElement.setValue('wont-be-our-passphrase');
        await confirmNewPassphaseElement.setValue('wont-be-our-passphrase');
        await changePassphraseButton.waitForEnabled();
        await changePassphraseButton.click();

        const okButton = await this.app.client.$('.error-step .ok-button');
        await okButton.waitForExist();
        await okButton.click();
        await okButton.waitForExist({reverse: true});

        await currentPassphraseElement.setValue(passphrase);
        await newPassphraseElement.setValue('temporary-passphrase');
        await confirmNewPassphaseElement.setValue('temporary-passphrase');
        await changePassphraseButton.waitForEnabled();
        await confirmNewPassphaseElement.setValue('doesnt-match');
        await changePassphraseButton.waitForEnabled({reverse: true});

        await confirmNewPassphaseElement.setValue('temporary-passphrase');
        await changePassphraseButton.waitForEnabled();
        await changePassphraseButton.click();

        const okButton2 = await this.app.client.$('.success-step .ok-button');
        await okButton2.waitForExist({timeout: 20e3});
        await okButton2.click();
        await okButton2.waitForExist({reverse: true});

        await currentPassphraseElement.setValue('temporary-passphrase');
        await newPassphraseElement.setValue(passphrase);
        await confirmNewPassphaseElement.setValue(passphrase);
        await changePassphraseButton.waitForEnabled();
        await changePassphraseButton.click();

        const okButton3 = await this.app.client.$('.success-step .ok-button');
        await okButton2.waitForExist({timeout: 20e3});
        await okButton3.click();
        await okButton3.waitForExist({reverse: true});

        // Wait some time so that there won't be a race condition unlocking the wallet in subsequent tests.
        await new Promise(r => setTimeout(r, 2e3));
    });

    it('anonymizes Firo', async function (this: This) {
        this.timeout(100e3);

        const publicBalanceElement = await this.app.client.$('.balance .public .amount');
        assert.isTrue(await publicBalanceElement.isExisting());
        const originalPublicBalance = convertToSatoshi(await publicBalanceElement.getText());

        const pendingBalanceElement = await this.app.client.$('.balance .pending .amount');
        let originalPendingBalance = 0;
        if (pendingBalanceElement.isExisting()) originalPendingBalance = convertToSatoshi(await pendingBalanceElement.getText());

        await (await this.app.client.$('#anonymize-firo-link')).click();
        await (await this.app.client.$('.anonymize-dialog')).waitForExist();
        await (await this.app.client.$('.anonymize-dialog button.cancel')).click();
        await (await this.app.client.$('.anonymize-dialog')).waitForExist({reverse: true});

        await (await this.app.client.$('#anonymize-firo-link')).click();
        await (await this.app.client.$('.anonymize-dialog')).waitForExist();
        await (await this.app.client.$('.anonymize-dialog input[type="password"]')).setValue(passphrase + "-invalid");
        await (await this.app.client.$('.anonymize-dialog button.confirm')).click();
        await (await this.app.client.$('.anonymize-dialog .error')).waitForExist();

        await (await this.app.client.$('.anonymize-dialog input[type="password"]')).setValue(passphrase);
        await (await this.app.client.$('.anonymize-dialog button.confirm')).click();
        await (await this.app.client.$('#popup')).waitForExist({reverse: true, timeout: 100e3});

        await publicBalanceElement.waitForExist({reverse: true});
        await this.app.client.waitUntil(async () =>
            convertToSatoshi(await pendingBalanceElement.getText()) > originalPublicBalance + originalPendingBalance - 0.1e8,
            {timeoutMsg: "new pending balance must be within 1 of original + newly anonymized funds"}
        );
    });

    it('displays and updates the receiving address', async function (this: This) {
        this.timeout(30e3);

        await (await this.app.client.$('a[href="#/receive"]')).click();

        const receiveAddressElement = await this.app.client.$('a.address');
        await receiveAddressElement.waitForExist();

        let originalReceiveAddress = await receiveAddressElement.getText();
        await this.app.client.executeAsyncScript(`$daemon.legacyRpc('generatetoaddress 1 ${originalReceiveAddress}').then(arguments[0])`, []);
        await this.app.client.waitUntil(async () => (await receiveAddressElement.getText()) !== originalReceiveAddress);
    });

    it('adds, edits, and properly orders receive addresses', async function (this: This) {
        this.timeout(30e3);

        const addressLabels: [string, string][] = [];

        for (let x = 0; x < 5; x++) {
            await (await this.app.client.$('a[href="#/send"]')).click();
            await (await this.app.client.$('a[href="#/receive"]')).click();
            await (await this.app.client.$('.address .loaded')).waitForExist();

            const label = String(Math.random());
            const address = await (await this.app.client.$('a.address')).getText();
            addressLabels.unshift([label, address]);

            await (await this.app.client.$('.label input[type="button"]')).click();
            const labelInput = await this.app.client.$('.label-input');
            await labelInput.waitForExist();
            await labelInput.setValue(label);
            await (await this.app.client.$('.label input[type="button"]')).click();
            await labelInput.waitForExist({reverse: true});
            await this.app.client.waitUntilTextExists('.address .label-text', label);
        }

        // [0..num_of_table_entries]
        const indexes = Array.from({length: (await this.app.client.$$('.address-book-item-editable-label')).length},(a, i) => i)

        // We don't want to shuffle because it may equal indexes, and we don't want to reverse because there might be a
        // bug that causes things to appear in reverse order.
        const rearrage = x => [...x.splice(x.length/2), ...x.splice(0, x.length/2+1)].splice(addressLabels.length);
        for (const i of rearrage(indexes)) {
            const newLabel = String(Math.random());
            addressLabels[i][1] = newLabel;

            await (await this.app.client.$$('.address-book-item-editable-label a'))[i].click();
            const inputElement = await this.app.client.$('.address-book-item-editable-label input');
            await inputElement.waitForExist();
            await inputElement.setValue(newLabel);
            await inputElement.keys('Enter');
            await inputElement.waitForExist({reverse: true});
        }

        await (await this.app.client.$('a[href="#/send"]')).click();
        await (await this.app.client.$('a[href="#/receive"]')).click();

        const actualLabels = (await this.app.client.$$('.animated-table .address-book-item-editable-label a'));
        const actualAddresses = (await this.app.client.$$('.address-book-item-address'));
        assert.isAtLeast(actualLabels.length, addressLabels.length);
        assert.isAtLeast(actualAddresses.length, addressLabels.length);
        for (const [i, [label, address]] of Object.entries(addressLabels)) {
            assert.equal(await actualAddresses[i].getText(), address);
            assert.equal(await actualLabels[i].getText(), label);
        }
    });

    function sendsAndReceivesPayment(
        paymentType: 'public' | 'private',
        subtractTransactionFee: boolean,
        customTransactionFee: boolean,
        coinControl: boolean
    ): (this: This) => Promise<void> {
        return async function (this: This) {
            this.timeout(100e3);

            // This is required so that the new transactions will be the first elements on the transactions list.
            await this.app.client.executeAsyncScript('$daemon.legacyRpc(arguments[0]).then(arguments[1])', ['generate 1']);

            const sendAddress = await this.app.client.executeAsyncScript(`$daemon.getUnusedAddress().then(arguments[0])`, []);
            const satoshiAmountToSend = 1e8 + Math.floor(1e8 * Math.random());
            const amountToSend = convertToCoin(satoshiAmountToSend);

            await (await this.app.client.$('a[href="#/send')).click();
            await (await this.app.client.$('#send-page')).waitForExist();

            if (paymentType === 'public') {
                const toggleInPrivateMode = await this.app.client.$('.private-public-balance .toggle.is-private');
                if (await toggleInPrivateMode.isExisting()) {
                    await (await this.app.client.$('.private-public-balance .toggle-switch')).click();
                    await toggleInPrivateMode.waitForExist({reverse: true});
                }
            } else {
                const toggleInPublicMode = await this.app.client.$('.private-public-balance .toggle.is-public');
                if (await toggleInPublicMode.isExisting()) {
                    await (await this.app.client.$('.private-public-balance .toggle-switch')).click();
                    await toggleInPublicMode.waitForExist({reverse: true});
                }
            }

            if (subtractTransactionFee) {
                await (await this.app.client.$('#subtract-fee-from-amount input')).click();
            }

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

            if (customTransactionFee) {
                const txFeeElement = await this.app.client.$('#transaction-fee .value .amount');
                const defaultTransactionFee = Number(await txFeeElement.getText());

                await (await this.app.client.$('.use-custom-fee input[type="checkbox"]')).click();
                await (await this.app.client.$('.use-custom-fee input[type="text"]')).setValue("999999");
                await sendButton.waitForEnabled({reverse: true});
                await sendButton.waitForEnabled();

                assert.isAbove(Number(await txFeeElement.getText()), defaultTransactionFee, "setting a fee of 999999 doesn't increase computed fee");

                // Make sure to set it down so that fee estimation doesn't go crazy high and ruin the test.
                await (await this.app.client.$('.use-custom-fee input[type="text"]')).setValue("9999");
                await sendButton.waitForEnabled({reverse: true});
                await sendButton.waitForEnabled();
            }

            const availableUTXOs = lodash.shuffle(
                <TransactionOutput[]>await this.app.client.execute((isPrivate) => {
                    return (<any>window).$store.getters['Transactions/availableUTXOs']
                        .filter(tx => ['mint', 'mintIn'].includes(tx.category) === isPrivate);
                }, paymentType === 'private')
            );
            const selectedUTXOs = [];
            let selectedUTXOsAmount = 0;
            for (const utxo of availableUTXOs) {
                if (selectedUTXOsAmount >= satoshiAmountToSend) break;
                selectedUTXOsAmount += utxo.amount;
                selectedUTXOs.push(`${utxo.txid}-${utxo.txIndex}`);
            }
            if (selectedUTXOsAmount < satoshiAmountToSend) assert.fail('insufficient utxos to cover send amount');

            if (coinControl) {
                await (await this.app.client.$('#custom-inputs-button')).click();

                let selectorsClicked = 0;
                while (true) {
                    for (const selectedUTXO of selectedUTXOs) {
                        const selector = await this.app.client.$(`#utxo-selector-${selectedUTXO}`);
                        if (await selector.isExisting()) {
                            await selector.click();
                            selectorsClicked += 1;
                        }
                    }

                    const nextPageLink = await this.app.client.$('#popup .next-page-link:not(.disabled)');
                    if (!await nextPageLink.isExisting()) break;
                    await nextPageLink.click();
                }
                assert.equal(selectorsClicked, selectedUTXOs.length, "we clicked an incorrect number of selectors");

                await (await this.app.client.$('#close-popup-button')).click();
            }

            await sendButton.waitForEnabled();
            await sendButton.click();

            const cancelButton = await this.app.client.$('button.cancel');
            await cancelButton.waitForExist();
            await cancelButton.click();
            await cancelButton.waitForExist({reverse: true});

            await sendButton.click();

            const confirmButton = await this.app.client.$('button.confirm');
            await confirmButton.waitForExist();
            const satoshiExpectedFee = convertToSatoshi(await (await this.app.client.$('.tx-fee-value .amount')).getText());
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
            await waiting.waitForExist({reverse: true, timeout: 100e3});

            const errorElement = await this.app.client.$('.error-step .content');
            if (await errorElement.isExisting()) {
                const error = await errorElement.getText();

                const closeErrorStep = await this.app.client.$('.error-step .ok-button');
                await closeErrorStep.click();
                await closeErrorStep.waitForExist({reverse: true});

                assert.fail(`sending transaction failed: ${error}`);
            }

            // Make sure fields are cleared.
            await this.app.client.waitUntil(async () => await label.getValue() === '')
            await this.app.client.waitUntil(async () => await address.getValue() === '')
            await this.app.client.waitUntil(async () => await amount.getValue() === '')

            await (await this.app.client.$('a[href="#/transactions')).click();

            let txOut: TransactionOutput;
            await this.app.client.waitUntil(async () => {
                txOut = await this.app.client.executeScript(
                    "return Object.values($store.getters['Transactions/transactions'])" +
                    ".find(tx => " +
                    "(arguments[2] ? tx.amount + tx.fee : tx.amount) === arguments[0] && " +
                    "tx.category === arguments[1] && " +
                    "!tx.isChange" +
                    ")",
                    [satoshiAmountToSend, paymentType === 'private' ? 'spendOut' : 'send', subtractTransactionFee]
                );
                return !!txOut;
            })
            assert.exists(txOut);

            if (paymentType === 'private' || !coinControl) {
                // fixme: currently public tx fee estimation ignores coin control, and is sometimes wrong.
                if (txOut.fee !== satoshiExpectedFee) {
                    console.error(`tx ${txOut.txid}: got fee ${txOut.fee}, expected ${satoshiExpectedFee}`);
                }
            }

            const satoshiAmountToReceive = subtractTransactionFee ? txOut.amount : satoshiAmountToSend;
            const txIn: TransactionOutput = await this.app.client.executeScript(
                "return Object.values($store.getters['Transactions/transactions'])" +
                    ".find(tx => " +
                        "tx.amount === arguments[0] && " +
                        "tx.category === arguments[1] && " +
                        "!tx.isChange" +
                    ")",
                [satoshiAmountToReceive, paymentType === 'private' ? 'spendIn' : 'receive']
            );
            assert.exists(txIn);

            const amountToReceive = convertToCoin(satoshiAmountToReceive);

            // The type signature of timeout on waitUntilTextExists is incorrect.
            await this.app.client.waitUntilTextExists('.vuetable-td-component-amount .incoming', amountToReceive, <any>{timeout: 10e3});
            await this.app.client.waitUntilTextExists('.vuetable-td-component-amount .outgoing', amountToReceive, <any>{timeout: 10e3});

            // Wait to make sure coin control entries are updated.
            await new Promise(r => setTimeout(r, 2e3));

            if (coinControl) {
                await (await this.app.client.$('a[href="#/send"]')).click();

                if (paymentType === 'public') {
                    await (await this.app.client.$('.private-public-balance .toggle-switch')).click();
                    await (await this.app.client.$('.private-public-balance .toggle.is-public')).waitForExist();
                }

                await (await this.app.client.$('#custom-inputs-button')).click();

                try {
                    while (true) {
                        for (const selectedUTXO of selectedUTXOs) {
                            const selector = await this.app.client.$(`#utxo-selector-${selectedUTXO}`);
                            if (await selector.isExisting()) {
                                assert.fail(`utxo ${selectedUTXO} is still in our list despite an attempt to use it`);
                            }
                        }

                        const nextPageLink = await this.app.client.$('#popup .next-page-link:not(.disabled)');
                        if (!await nextPageLink.isExisting()) break;
                        await nextPageLink.click();
                    }
                } finally {
                    const closePopupButton = await this.app.client.$('#close-popup-button');
                    await closePopupButton.click();
                    await closePopupButton.waitForExist({reverse: true});
                }
            }
        };
    }

    it('sends and receives a private payment', sendsAndReceivesPayment('private', false, false, false));
    it('sends and receives a public payment', sendsAndReceivesPayment('public', false, false, false));
    it('sends and receives a private payment subtracting tx fee', sendsAndReceivesPayment('private', true, false, false));
    it('sends and receives a public payment subtracting tx fee', sendsAndReceivesPayment('public', true, false, false));
    it('sends and receives a private payment with custom fee', sendsAndReceivesPayment('private', false, true, false));
    it('sends and receives a public payment with custom fee', sendsAndReceivesPayment('public', false, true, false));
    it('sends and receives a private payment with custom fee subtracted', sendsAndReceivesPayment('private', true, true, false));
    it('sends and receives a private payment with coin control', sendsAndReceivesPayment('private', true, false, true));
    it('sends and receives a public payment with coin control', sendsAndReceivesPayment('public', true, false, true));

    function hasCorrectBalance(balanceType: 'public' | 'private'): (this: This) => Promise<void> {
        return async function (this: This) {
            this.timeout(100e3);

            await (await this.app.client.$('a[href="#/send"]')).click();

            const balanceElement = await this.app.client.$(`.balance .${balanceType} .amount`);
            let balance = 0;
            if (await balanceElement.isExisting()) {
                balance = convertToSatoshi(await balanceElement.getText());
            }

            if (balanceType === 'public') {
                const toggleInPrivateMode = await this.app.client.$('.private-public-balance .toggle.is-private');
                if (await toggleInPrivateMode.isExisting()) {
                    await (await this.app.client.$('.private-public-balance .toggle-switch')).click();
                    await toggleInPrivateMode.waitForExist({reverse: true});
                }
            } else {
                const toggleInPublicMode = await this.app.client.$('.private-public-balance .toggle.is-public');
                if (await toggleInPublicMode.isExisting()) {
                    await (await this.app.client.$('.private-public-balance .toggle-switch')).click();
                    await toggleInPublicMode.waitForExist({reverse: true});
                }
            }

            await (await this.app.client.$('#custom-inputs-button')).click();
            await (await this.app.client.$('#popup .animated-table')).waitForExist();
            let sumOfInputs = 0;
            while (true) {
                sumOfInputs = (await Promise.all(
                    (await this.app.client.$$('#popup .amount')).map(async e =>
                        convertToSatoshi(await e.getText())
                    )
                )).reduce((a, x) => a + x, sumOfInputs);

                const nextPageLink = await this.app.client.$('#popup .next-page-link:not(.disabled)');
                if (!await nextPageLink.isExisting()) break;
                await nextPageLink.click();
            }

            try {
                assert.equal(convertToCoin(sumOfInputs), convertToCoin(balance), `expected - actual == ${convertToCoin(balance - sumOfInputs)}`);
            } finally {
                const closePopupButton = await this.app.client.$('#close-popup-button');
                await closePopupButton.click();
                await closePopupButton.waitForExist({reverse: true});
            }
        };
    }

    it('has private coin control entries that sum to the correct amount', hasCorrectBalance('private'));
    it('has public coin control entries that sum to the correct amount', hasCorrectBalance('public'));

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
        // Due to bugs in WebdriverIO, we can't actually focus #current-input without this.
        const currentInput = await this.app.client.$('#current-input');
        await (await this.app.client.$('a[href="#/settings"]')).click();
        await currentInput.waitForExist({reverse: true});
        await (await this.app.client.$('a[href="#/debugconsole"]')).click();
        await currentInput.waitForExist();

        for (const [cmd, expectedOutput] of [['getinfo', '"relayfee"'], ['help move', 'Move 0.01 FIRO from the default account']]) {
            await this.app.client.keys([...cmd.split(''), "Enter"]);
            await this.app.client.waitUntil(async () => {
                let hasResponse = false;
                for (const e of await this.app.client.$$('.output')) {
                    if ((await e.getText()).includes(expectedOutput)) {
                        return true;
                    }
                }
            }, {timeout: 10e3, timeoutMsg: `expected output of ${cmd} has not appeared in the debug console`, interval: 500});
        }
    });
});