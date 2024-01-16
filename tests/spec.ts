/// <reference path="../src/globals.d.ts" />

process.env.FIRO_CLIENT_TEST = 'true';
process.env.DEBUG = "pw:browser";

import {_electron as electron, ElectronApplication, Page} from "playwright";
import lodash from 'lodash';
import path from 'path';
import os from 'os';
import fs from 'fs';
import {assert} from 'chai';
import {bigintToString, stringToBigint} from "../src/lib/convert";
import {TXO} from "../src/store/modules/Transactions";

interface This extends Mocha.Context {
    app: ElectronApplication;
    page: Page;
}

const BUILD = !(process.env.NO_BUILD && JSON.parse(process.env.NO_BUILD));
if (BUILD) {
    before(async function () {
        this.timeout(1000e3); // Make sure we have enough time to build our app.
        await require('../electron-vue/build');
    });
}

const passphrase = 'sloth';
let mnemonicWords: string[];

function scaffold(this: Mocha.Suite, reinitialize: boolean) {
    this.timeout(20e3);
    this.slow(5e3);

    this.beforeAll('starts the wallet with tracing', <any>async function (this: This) {
        process.env.IS_INITIALIZED = JSON.stringify(!reinitialize);

        this.app = await electron.launch({
            args: [path.join(__dirname, '..', 'dist', 'electron', 'main.js')]
        });
        await this.app.context().tracing.start({
            title: `Firo Client Test - ${new Date()}`,
            screenshots: true,
            snapshots: true
        });

        this.page = await this.app.firstWindow();
        this.page.setDefaultTimeout(5e3);
    });

    this.afterAll('closes the wallet and stops tracing', <any>async function (this: This) {
        await this.app.context().tracing.stop({path: path.join(__dirname, '..', 'traces', `${Date.now()}.zip`)});
        await this.app.close();
    });
}

describe('Regtest Setup', function (this: Mocha.Suite) {
    scaffold.bind(this)(true);
    this.bail(true);

    it('starts', <any>async function (this: This) {
        await this.page.locator('button').click();
        await this.page.locator('select').waitFor();
    });

    it('allows selecting blockchain location and network', <any>async function (this: This) {
        await this.page.locator('#datadir-selector').selectOption('regtest-ql');

        const defaultDataDirLocation = await this.page.locator('#datadir-value').innerText();
        const testDataDirLocation = path.join(os.tmpdir(), `firo-client-test-${Math.floor(Math.random() * 1e16)}`);

        fs.mkdirSync(testDataDirLocation);

        // Creating a new directory is in normal usage taken care of by the file selection dialog, which can't be automated.
        const setDataDir = async (dataDirLocation: string) => await this.page.evaluate(([ddl]) => {
            const ev = new Event('set-data-dir');
            ev['dataDir'] = ddl;
            document.dispatchEvent(ev);
        },[dataDirLocation]);

        await setDataDir(testDataDirLocation);
        await this.page.locator('#datadir-value', {hasText: testDataDirLocation}).waitFor();

        await this.page.locator('#reset-data-dir').click();
        await this.page.locator('#datadir-value', {hasText: defaultDataDirLocation}).waitFor();


        await setDataDir(testDataDirLocation);
        await this.page.locator('#datadir-value', {hasText: testDataDirLocation}).waitFor();


        await this.page.locator('button').click();
        await this.page.locator('.select-create-or-restore').waitFor();
    });

    it('correctly displays and confirms mnemonic', <any>async function (this: This) {
        await this.page.locator('#create-new-wallet').click();
        await this.page.locator('.write-down-mnemonic').waitFor();

        mnemonicWords = await this.page.locator('.mnemonic-word .word').allInnerTexts();
        assert.equal(mnemonicWords.length, 24);

        await this.page.locator('#confirm-button').click();
        await this.page.locator('.confirm-mnemonic').waitFor();

        const wordElements = await this.page.locator('.mnemonic-word .word').all();
        let lastHiddenIndex: number = 0;

        for (const [n, wordElement] of Object.entries(wordElements)) {
            const classNames = (await wordElement.getAttribute('class'))?.split(' ') || [];
            if (classNames.includes('hidden')) {
                lastHiddenIndex = Number(n);
                await wordElement.fill(mnemonicWords[n]);
            } else {
                assert.equal(await wordElement.innerText(), mnemonicWords[n]);
            }
        }

        await this.page.locator('#ok-button:enabled').waitFor();

        // Test incorrect words.
        await wordElements[lastHiddenIndex].fill('invalid-word');
        await this.page.locator('#ok-button:disabled').waitFor();

        // Set it back to the valid word.
        await wordElements[lastHiddenIndex].fill(mnemonicWords[lastHiddenIndex]);

        await this.page.locator('#ok-button').click()

        await this.page.locator('#passphrase').waitFor();
    });

    it('goes back from the passphrase step', <any>async function (this: This) {
        await this.page.locator('#back-button').click();
        await this.page.locator('.confirm-mnemonic').waitFor();

        const wordElements = await this.page.locator('.mnemonic-word .word').all();
        for (const [n, wordElement] of Object.entries(wordElements)) {
            const classNames = (await wordElement.getAttribute('class'))?.split(' ') || [];
            if (!classNames.includes('hidden'))
                assert.equal(await wordElement.innerText(), mnemonicWords[n]);
        }

        await this.page.locator('#back-button').click();
        await this.page.locator('.write-down-mnemonic').waitFor();

        const nonHiddenWordElements = await this.page.locator('.mnemonic-word .word').all();
        for (const [n, wordElement] of Object.entries(nonHiddenWordElements)) {
            assert.equal(await wordElement.innerText(), mnemonicWords[n]);
        }

        await this.page.locator('#back-button').click();
        await this.page.locator('#recover-from-mnemonic').waitFor();
    });

    it('can recover from mnemonics', <any>async function (this: This) {
        let twelveMnemonicWords = ["nation", "tip", "mean", "govern", "tide", "comic", "figure", "gift", "upper", "love", "kitchen", "dolphin"];

        await this.page.locator('#recover-from-mnemonic').click();

        await this.page.locator('input[value="12"]').click();
        await this.page.locator('#mnemonic-word-13').waitFor({state: 'hidden'});

        const twelveMnemonicWordElements = await this.page.locator('input.mnemonic-word').all();
        for (const [n, word] of Object.entries(twelveMnemonicWords)) {
            await twelveMnemonicWordElements[n].fill(word);
        }

        await this.page.locator('#ok-button:enabled').waitFor();

        await twelveMnemonicWordElements[0].fill('invalid');
        await this.page.locator('#ok-button:disabled').waitFor();

        await this.page.locator('input[value="24"]').click();
        await this.page.locator('#mnemonic-word-13').waitFor();

        const twentyFourMnemonicWordElements = await this.page.locator('input.mnemonic-word').all();
        for (const [n, word] of Object.entries(mnemonicWords)) {
            await twentyFourMnemonicWordElements[n].fill(word);
        }

        await this.page.locator('#ok-button:enabled').waitFor();

        await twentyFourMnemonicWordElements[0].fill('invalid');
        await this.page.locator('#ok-button:disabled').waitFor();

        await twentyFourMnemonicWordElements[0].fill(mnemonicWords[0]);

        await this.page.locator('#ok-button').click();
        await this.page.locator('#passphrase').waitFor();
    });

    it('locks the wallet', <any>async function (this: This) {
        this.timeout(60e3);
        this.slow(20e3);

        await this.page.locator('#passphrase').fill(passphrase);
        await this.page.locator('#confirm-passphrase').fill(passphrase);
        await this.page.locator('#ok-button:enabled').waitFor();

        await this.page.locator('#confirm-passphrase').fill(passphrase + 'invalid');
        await this.page.locator('#ok-button:disabled').waitFor();

        await this.page.locator('#confirm-passphrase').fill(passphrase);

        await this.page.locator('#ok-button').click();

        await this.page.locator('.transactions-page').waitFor({timeout: 60e3});
    });

    it('is using regtest-ql', <any>async function (this: This) {
        const badge = this.page.locator('.network-badge');
        assert.isTrue(await badge.isVisible());
        assert.equal(await badge.innerText(), 'Regtest');
    });

    it('generates FIRO from the debug console', <any>async function (this: This) {
        this.timeout(500e3);
        this.slow(100e3);

        await this.page.locator('a[href="#/debugconsole"]').click();

        const currentInput = await this.page.locator('#current-input')
        await currentInput.type('generate 100');
        await currentInput.press('Enter');

        let i = 0;
        while (await currentInput.innerText() != '') {
            if (i++ > 490)
                assert.fail('Timed out waiting for the debug console to be ready');

            await new Promise(r => setTimeout(r, 1e3));
        }

        await this.page.locator('.balance.immature .amount', {hasText: '4000'}).waitFor();
    });
});

function randstr(): string {
    return Array(10).fill(0).map(_ => String.fromCharCode(97+Math.random()*26)).join('');
}

describe('Opening an Existing Wallet', function (this: Mocha.Suite) {
    process.env.IS_INITIALIZED = 'true';
    scaffold.bind(this)(false);

    this.beforeAll('waits to load our wallet', <any>async function (this: This) {
        if (process.env.FIROD_ARGS?.includes('-wait-for-usr1')) {
            this.timeout(Number.MAX_VALUE);
            this.slow(Number.MAX_VALUE);
            await this.page.waitForSelector('td', {timeout: 0});
        } else {
            this.timeout(60e3);
            this.slow(20e3);
            await this.page.waitForSelector('td', {timeout: 60e3});
        }
    });

    this.beforeAll('is using regtest-ql', <any>async function (this: This) {
        await this.page.locator('.network-badge', {hasText: 'Regtest'}).waitFor();
    });

    async function setElysium(this: This, status: boolean) {
        if (await this.page.locator('a[href="#/elysium"]').isVisible() == status)
            return;

        await this.page.locator('a[href="#/settings"]').click();
        await this.page.locator('#enable-elysium-checkbox').click();
        await this.page.locator('.waiting-screen').waitFor();
        await this.page.locator('.waiting-screen').waitFor({state: 'detached', timeout: 60e3});
    }

    async function mintAll(this: This) {
        await this.page.evaluate(([pw]) => $daemon.mintAll(pw), [passphrase]);
        // Wait so that new mints have time to get out from the upcoming transactions queue.
        await new Promise(r => setTimeout(r, 1e3));
    }

    async function generateSufficientFiro(this: This) {
        this.timeout(200e3);
        this.slow(100e3);

        const privateBalanceElement = this.page.locator('.balance.private .amount-value');
        const publicBalanceElement = this.page.locator('.balance.public .amount-value');

        while (!await publicBalanceElement.isVisible() || Number(await publicBalanceElement.innerText()) < 40) {
            // Probably we're mining all the blocks ourselves.
            await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));
        }

        while (Number(await privateBalanceElement.innerText()) < 20) {
            await mintAll.bind(this)();

            while (!await publicBalanceElement.isVisible()) {
                await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));
            }
            await mintAll.bind(this)();

            await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));
        }
    }
    this.beforeEach('generates Firo if not enough is available', <any>generateSufficientFiro);

    it('can change the passphrase', <any>async function (this: This) {
        this.timeout(100e3);

        await this.page.locator('a[href="#/settings"]').click();

        await this.page.locator('#change-passphrase-button').click();
        await this.page.locator('.change-passphrase-popup').waitFor();
        await this.page.locator('#cancel-button').click();
        await this.page.locator('.change-passphrase-popup').waitFor({state: 'detached'});

        await this.page.locator('#change-passphrase-button').click();
        await this.page.locator('.change-passphrase-popup').waitFor();
        await this.page.locator('#current-passphrase').fill('invalid-passphrase');
        await this.page.locator('#new-passphrase').fill('wont-be-our-passphrase');
        await this.page.locator('#confirm-new-passphrase').fill('wont-be-our-passphrase');
        await this.page.locator('#confirm-button').click();
        await this.page.locator('.change-passphrase-popup .error').waitFor();
        assert.equal(await this.page.locator('.change-passphrase-popup .error').innerText(), 'Incorrect Passphrase');

        await this.page.locator('#current-passphrase').fill(passphrase);
        await this.page.locator('#new-passphrase').fill(passphrase + '_');
        await this.page.locator('#confirm-new-passphrase').fill(passphrase + '_');
        await this.page.locator('#confirm-button:enabled').waitFor();
        await this.page.locator('#confirm-new-passphrase').fill(passphrase + '__');
        await this.page.locator('#confirm-button:disabled').waitFor();
        await this.page.locator('#confirm-new-passphrase').fill(passphrase + '_');
        await this.page.locator('#confirm-button').click();
        await this.page.locator('#ok-button').click();
        await this.page.locator('.change-passphrase-popup').waitFor({state: 'detached', timeout: 100e3});

        // Change the passphrase back, avoiding race conditions.
        await new Promise(r => setTimeout(r, 500));
        await this.page.evaluate(
            ([oldpw, newpw]) => $daemon.setPassphrase(oldpw, newpw),
            [passphrase + '_', passphrase]
        );
        await new Promise(r => setTimeout(r, 500));
    });

    it('anonymizes Firo', <any>async function (this: This) {
        this.timeout(100e3);

        const publicBalanceElement = this.page.locator('.balance.public .amount-value');
        assert.isTrue(await publicBalanceElement.isVisible());
        const originalPublicBalance = stringToBigint(await publicBalanceElement.innerText());

        await this.page.locator('#anonymize-firo-link').click();
        await this.page.locator('.passphrase-input').waitFor();
        await this.page.locator('.passphrase-input button.cancel').click();
        await this.page.locator('.passphrase-input').waitFor({state: "detached"});

        await this.page.locator('#anonymize-firo-link').click();
        await this.page.locator('.passphrase-input').waitFor();
        await this.page.locator('.passphrase-input input[type="password"]').fill(passphrase + "-invalid");
        await this.page.locator('.passphrase-input button.confirm').click();
        await this.page.locator('.passphrase-input .error').waitFor();

        await this.page.locator('.passphrase-input input[type="password"]').fill(passphrase);
        await this.page.locator('.passphrase-input button.confirm').click();
        await this.page.locator('#popup').waitFor({state: "detached", timeout: 100e3});

        let i = 0;
        while (await publicBalanceElement.isVisible() && stringToBigint(await publicBalanceElement.innerText()) < 100000n) {
            if (i++ > 100)
                assert.fail("public balance should be below 0.001 FIRO");

            await new Promise(r => setTimeout(r, 1e3));
        }

        let j = 0;
        while (stringToBigint(await this.page.locator('.balance.pending .amount-value').innerText()) < originalPublicBalance - 10000000n) {
            if (j++ > 100)
                assert.fail("pending balance should be above 0.1 FIRO");

            await new Promise(r => setTimeout(r, 1e3));
        }
    });

    it('displays and updates the receiving address', <any>async function (this: This) {
        this.timeout(30e3);

        await this.page.locator('a[href="#/receive"]').click();

        const receiveAddressElement = await this.page.locator('#receive-address');

        let originalReceiveAddress = await receiveAddressElement.inputValue();
        await this.page.evaluate(
            ([addr]) => $daemon.legacyRpc(`generatetoaddress 1 ${addr}`),
            [originalReceiveAddress]
        );

        let i = 0;
        while (await receiveAddressElement.inputValue() == originalReceiveAddress) {
            if (i++ > 10)
                assert.fail("receive address should change");

            await new Promise(r => setTimeout(r, 1e3));
        }
    });

    it('adds, edits, and properly orders receive addresses', <any>async function (this: This) {
        this.timeout(30e3);

        await this.page.locator('a[href="#/receive"]').click();

        const receiveAddress = this.page.locator('#receive-address');
        const receiveAddressLabel = this.page.locator('#receive-address-label');

        // This is used to avoid a race condition that appears only when tests are sequentially executed.
        const originalAddress = await receiveAddress.inputValue();
        await this.page.locator('td.address', {hasText: originalAddress}).waitFor();

        const addressLabels: [string, string][] = [];

        for (let x = 0; x < 5; x++) {
            const label = randstr();
            const address = await receiveAddress.inputValue();
            await receiveAddressLabel.fill(label);
            await receiveAddressLabel.blur();
            await this.page.locator('tr:nth-child(2) td.label', {hasText: label}).waitFor();
            addressLabels.unshift([label, address]);

            await this.page.locator('tr:nth-child(1) td.label').click();

            while (await receiveAddress.inputValue() == address) {
                await new Promise(r => setTimeout(r, 1e3));
            }

            assert.notEqual(await receiveAddressLabel.inputValue(), label);
        }

        const i = 2;
        await this.page.locator('tr').nth(i+2).click();
        while (await receiveAddress.inputValue() != addressLabels[i][1])
            await new Promise(r => setTimeout(r, 1e3));

        addressLabels[i][0] = randstr();
        await receiveAddressLabel.fill(addressLabels[i][0]);
        await receiveAddressLabel.blur()
        await this.page
            .locator(`tr:nth-child(${i+2}) td.label`, {hasText: addressLabels[i][0]})
            .waitFor();

        await this.page.locator('a[href="#/send"]').click();
        await this.page.locator('.send-page').waitFor();
        await this.page.locator('a[href="#/receive"]').click();
        await receiveAddress.waitFor();

        const actualLabels = this.page.locator('td.label');
        const actualAddresses = this.page.locator('td.address');
        assert.isAtLeast(await actualLabels.count(), addressLabels.length);
        assert.isAtLeast(await actualAddresses.count(), addressLabels.length);
        for (const [i_, [label, address]] of Object.entries(addressLabels)) {
            const i = Number(i_);

            if (await actualAddresses.count() < i+1)
                break;

            assert.equal(await actualAddresses.nth(i+1).innerText(), address);
            assert.equal(await actualLabels.nth(i+1).innerText(), label);
        }
    });

    function sendsAndReceivesPayment(
        paymentType: 'public' | 'private',
        subtractTransactionFee: boolean,
        customTransactionFee: boolean,
        coinControl: boolean,
        checkValidations: boolean = false,
        elysium: boolean = false
    ): (this: This) => Promise<void> {
        return <any>async function (this: This) {
            this.timeout(100e3);

            await setElysium.bind(this)(elysium);

            // This is required so that the new transactions will be the first elements on the transactions list.
            await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));

            const sendAddress: string = await this.page.evaluate(() => $daemon.getUnusedAddress());
            const satoshiAmountToSend = 100000000n + BigInt(Math.floor(1e8 * Math.random()));
            const amountToSend = bigintToString(satoshiAmountToSend);

            await this.page.locator('a[href="#/send"]').click();
            await this.page.locator('.send-page').waitFor();

            if (paymentType === 'public') {
                const toggleInPrivateMode = await this.page.locator('.private-public-balance .toggle.is-private');
                if (await toggleInPrivateMode.isVisible()) {
                    await this.page.locator('.private-public-balance .toggle-switch').click();
                    await toggleInPrivateMode.waitFor({state: 'hidden'})
                }
            } else {
                const toggleInPublicMode = await this.page.locator('.private-public-balance .toggle.is-public');
                if (await toggleInPublicMode.isVisible()) {
                    await this.page.locator('.private-public-balance .toggle-switch').click();
                    await toggleInPublicMode.waitFor({state: 'hidden'});
                }
            }

            if (subtractTransactionFee) {
                await this.page.locator('#subtract-fee-from-amount').click();
            }

            const sendButton = this.page.locator('#send-button');
            const label = this.page.locator('#label')
            const address = this.page.locator('#address');
            const amount = this.page.locator('#amount');

            // Set up a valid form.

            await address.fill(sendAddress);
            await amount.fill(amountToSend);
            await this.page.locator('#send-button:enabled').waitFor();

            if (checkValidations) {
                await amount.fill('0.0000000001');
                await this.page.locator('#send-button:disabled').waitFor();
                await amount.fill(amountToSend);
                await this.page.locator('#send-button:enabled').waitFor();

                await amount.fill('99999999999999');
                await this.page.locator('#send-button:disabled').waitFor();
                await amount.fill(amountToSend);
                await this.page.locator('#send-button:enabled').waitFor();

                await address.fill('invalid-address');
                await this.page.locator('#send-button:disabled').waitFor();
                await address.fill(sendAddress);
                await this.page.locator('#send-button:enabled').waitFor();
            }

            const availableUTXOs = lodash.shuffle(
                <TXO[]>await this.page.evaluate(([privacyUse]) =>
                        $store.getters['Transactions/availableUTXOs']
                            .filter(tx => tx.privacyUse === privacyUse)
                            .map(tx => ({...tx, amount: String(tx.amount)}))
                    , [paymentType === 'private' ? 'spark' : 'public'])
            ).map(tx => ({...tx, amount: BigInt(tx.amount)}));

            const selectedUTXOs: string[] = [];
            let selectedUTXOsAmount = 0n;
            for (const utxo of availableUTXOs) {
                if (selectedUTXOsAmount >= satoshiAmountToSend) break;
                selectedUTXOsAmount += utxo.amount;
                selectedUTXOs.push(`${utxo.txid}-${utxo.index}`);
            }
            if (selectedUTXOsAmount < satoshiAmountToSend) assert.fail('insufficient utxos to cover send amount');

            if (coinControl) {
                await this.page.locator('#custom-inputs-button').click();

                let selectorsClicked = 0;
                while (true) {
                    for (const selectedUTXO of selectedUTXOs) {
                        const selector = this.page.locator(`#utxo-selector-${selectedUTXO}`);
                        if (await selector.isVisible()) {
                            await selector.click();
                            selectorsClicked++;
                        }
                    }

                    const nextPageLink = this.page.locator('#popup .next-page-link:not(.disabled)');
                    if (!await nextPageLink.isVisible()) break;
                    await nextPageLink.click();
                }

                try {
                    assert.equal(selectorsClicked, selectedUTXOs.length, "we clicked an incorrect number of selectors");
                } finally {
                    await this.page.locator('.input-selection-popup button.recommended').click();
                    await this.page.locator('.input-selection-popup button.recommended').waitFor({state: 'detached'});
                }
            }

            await this.page.locator('#use-custom-fee').click();
            const computedTxFeeElement = this.page.locator('#computed-transaction-fee .amount-value');
            const txFeeInput = this.page.locator('#txFeePerKb');
            assert(txFeeInput.isVisible());
            let txFeePerKb = Number(await txFeeInput.getAttribute('placeholder'));
            assert.isAtLeast(txFeePerKb, 1);
            if (customTransactionFee) {
                assert(computedTxFeeElement.isVisible());
                const originalFee = stringToBigint(await computedTxFeeElement.innerText());

                txFeePerKb = Math.min(999999, txFeePerKb*2);
                await txFeeInput.fill(String(txFeePerKb));
                while (stringToBigint(await computedTxFeeElement.innerText()) <= originalFee)
                    await new Promise(r => setTimeout(r, 100));
            }
            const satoshiExpectedFee = stringToBigint(await computedTxFeeElement.innerText());

            await sendButton.click();

            if (checkValidations) {
                const cancelButton = this.page.locator('.confirm-step button.unrecommended');
                await cancelButton.click();
                await cancelButton.waitFor({state: 'detached'});

                await sendButton.click();
            }

            await this.page.locator('.confirm-step button.recommended').click();

            const passphraseInput = this.page.locator('.passphrase-input input[type="password"]');
            const passphraseInputButton = this.page.locator('.passphrase-input button.recommended');

            if (checkValidations) {
                await passphraseInput.fill(passphrase + '-invalid');
                await passphraseInputButton.click()

                await this.page.locator('.passphrase-input .error').waitFor();
            }

            await passphraseInput.fill(passphrase);
            await passphraseInputButton.click();

            const waitOverlay = this.page.locator('.wait-overlay');
            await waitOverlay.waitFor();
            await waitOverlay.waitFor({state: 'detached'});

            const errorElement = this.page.locator('.error-step .content');
            if (await errorElement.isVisible()) {
                const error = await errorElement.innerText();

                await this.page.locator('.error-step button.recommended').click();
                await this.page.locator('.error-step').waitFor({state: 'detached'});

                assert.fail(`sending transaction failed: ${error}`);
            }

            // Make sure fields are cleared.
            while (await label.inputValue() || await address.inputValue() || await amount.inputValue()) {
                await new Promise(r => setTimeout(r, 100));
            }

            await this.page.locator('a[href="#/transactions"]').click();

            const expectedAmountToReceive = subtractTransactionFee ? satoshiAmountToSend - satoshiExpectedFee : satoshiAmountToSend;
            await this.page.locator('td .amount', {hasText: bigintToString(expectedAmountToReceive)}).waitFor();

            await this.page.locator('td').first().click();
            await this.page.locator('.info-popup').waitFor();

            const txid = await this.page.locator('.txid').innerText();
            const fee = stringToBigint(await this.page.locator('.fee .amount-value').innerText());
            const amountReceived = stringToBigint(await this.page.locator('.received-amount .amount-value').innerText());

            await this.page.locator('.txinfo-ok').click();
            await this.page.locator('.info-popup').waitFor({state: 'detached'});

            assert.equal(fee, satoshiExpectedFee, `actual fee was not equal to calculated fee (expected fee/kb ${txFeePerKb}, txid ${txid})`);
            assert.equal(amountReceived, subtractTransactionFee ? satoshiAmountToSend - fee : satoshiAmountToSend, 'amount received not equal to expected value');

            if (coinControl) {
                await this.page.locator('a[href="#/send"]').click();

                if (paymentType === 'public') {
                    await this.page.locator('.private-public-balance .toggle-switch').click();
                    await this.page.locator('.private-public-balance .toggle.is-public').waitFor();
                }

                await this.page.locator('#custom-inputs-button').click();

                try {
                    const nextPageLink = this.page.locator('#popup .next-page-link:not(.disabled)');
                    while (true) {
                        for (const selectedUTXO of selectedUTXOs) {
                            if (await this.page.locator(`#utxo-selector-${selectedUTXO}`).isVisible())
                                assert.fail(`utxo ${selectedUTXO} is still in our list despite an attempt to use it`);
                        }

                        if (!await nextPageLink.isVisible())
                            break;

                        await nextPageLink.click();
                    }
                } finally {
                    const closePopupButton = this.page.locator('#popup button.recommended');
                    await closePopupButton.click();
                    await closePopupButton.waitFor({state: 'detached'});
                }
            }
        };
    }

    it('checks send validations', <any>sendsAndReceivesPayment('private', false, false, false, true));
    it('sends and checks validations with Elysium enabled', <any>sendsAndReceivesPayment('private', false, false, false, true, true));
    it('sends and receives a private payment', <any>sendsAndReceivesPayment('private', false, false, false));
    it('sends and receives a public payment', <any>sendsAndReceivesPayment('public', false, false, false));
    it('sends and receives a private payment subtracting tx fee', <any>sendsAndReceivesPayment('private', true, false, false));
    it('sends and receives a public payment subtracting tx fee', <any>sendsAndReceivesPayment('public', true, false, false));
    it('sends and receives a private payment with custom fee', <any>sendsAndReceivesPayment('private', false, true, false));
    it('sends and receives a public payment with custom fee', <any>sendsAndReceivesPayment('public', false, true, false));
    it('sends and receives a private payment with custom fee subtracted', <any>sendsAndReceivesPayment('private', true, true, false));
    it('sends and receives a private payment with coin control', <any>sendsAndReceivesPayment('private', true, false, true));
    it('sends and receives a public payment with coin control', <any>sendsAndReceivesPayment('public', true, false, true));

    function hasCorrectBalance(balanceType: 'public' | 'private'): (this: This) => Promise<void> {
        return <any>async function (this: This) {
            this.timeout(100e3);

            await this.page.locator('a[href="#/send"]').click();

            const balanceElement = this.page.locator(`.balance .${balanceType} .amount`);
            let balance = 0n;
            if (await balanceElement.isVisible()) {
                balance = stringToBigint(await balanceElement.innerText());
            }

            const toggleSwitch = this.page.locator('.private-public-balance .toggle-switch');
            const toggleInPublicMode = this.page.locator('.private-public-balance .toggle.is-public');
            const toggleInPrivateMode = this.page.locator('.private-public-balance .toggle.is-private');
            if (balanceType === 'public') {
                if (await toggleInPrivateMode.isVisible()) {
                    await toggleSwitch.click();
                    await toggleInPublicMode.waitFor();
                }
            } else {
                if (await toggleInPublicMode.isVisible()) {
                    await toggleSwitch.click();
                    await toggleInPrivateMode.waitFor();
                }
            }

            await this.page.locator('#custom-inputs-button').click();
            await this.page.locator('#popup .animated-table').waitFor();
            let sumOfInputs = 0n;
            while (true) {
                sumOfInputs = (await Promise.all(
                    (await this.page.locator('#popup .amount-value').all()).map(async l =>
                        stringToBigint(await l.innerText())
                    )
                )).reduce((a, x) => a + x, sumOfInputs);

                const nextPageLink = this.page.locator('#popup .next-page-link:not(.disabled)');
                if (!await nextPageLink.isVisible()) break;
                await nextPageLink.click();
            }

            try {
                assert.equal(bigintToString(sumOfInputs), bigintToString(balance), `expected - actual == ${bigintToString(balance - sumOfInputs)}`);
            } finally {
                const closePopupButton = this.page.locator('#popup button.recommended');
                await closePopupButton.click();
                await closePopupButton.waitFor({state: 'detached'});
            }
        };
    }

    async function testCreateElysiumToken(this: This) {
        this.timeout(100e3);

        // Make sure our token will be the first in the list so tests work.
        await this.page.evaluate(() => $daemon.legacyRpc('generate 1'), []);

        await setElysium.bind(this)(true);

        await this.page.locator('a[href="#/elysium"]').click();
        await this.page.locator('.elysium-page').waitFor();
        await this.page.locator('#createToken').click();

        const name = randstr();
        const ticker = randstr().toUpperCase().slice(0, 3);
        const category = randstr();
        const description = randstr();
        const url = `https://example.com/${randstr()}/`;
        const issuanceAmount = String(Math.floor(Math.random() * 1e6) + 1);

        await this.page.locator('input[name="name"]').fill(name);
        await this.page.locator('input[name="ticker"]').fill(ticker);
        await this.page.locator('input[name="category"]').fill(category);
        await this.page.locator('textarea[name="description"]').fill(description);
        await this.page.locator('input[name="url"]').fill(url);
        await this.page.locator('input[name="issuanceAmount"]').fill(issuanceAmount);

        await this.page.locator('#ok').click();

        await this.page.locator('input[type="password"]').fill(passphrase);
        await this.page.locator('.passphrase-input button.recommended').click();

        for (const [k, v] of [
            ['.elysium-id', "\ueffa"],
            ['.elysium-name', name],
            ['.elysium-ticker', ticker],
            ['.elysium-private-balance', "0"],
            ['.elysium-pending-balance', issuanceAmount]
        ]) {
            await this.page.locator(`tr:nth-child(1) ${k}:has-text("${v}")`).waitFor({timeout: 5e3});
        }

        await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));

        for (let i=0; i <= 20; i++) {
            if (i == 20)
                assert.fail('Timed out waiting for token to be confirmed');

            if (await this.page.locator('.elysium-id').first().innerText() != "\ueffa")
                break;

            await new Promise(r => setTimeout(r, 250));
        }

        await this.page.locator('a[href="#/transactions"]').click();
        await this.page.locator('tr:nth-child(2) .ticker', {hasText: ticker}).waitFor();
    }
    it('allows creating an Elysium token', <any>testCreateElysiumToken);

    async function testAnonymizesElysiumTokens(this: This): Promise<string> {
        this.timeout(100e3);

        await testCreateElysiumToken.bind(this)();

        await this.page.locator('a[href="#/transactions"]').click();
        await this.page.locator('.transactions-page').waitFor();
        await this.page.locator('tr:nth-child(2)').click();

        const id = await this.page.locator('.elysium-property-creation-tx .txid').innerText();
        const creationAmount = stringToBigint(await this.page.locator('.received-amount .amount-value').innerText()) * BigInt(1e8);
        await this.page.locator('button.recommended').click();

        const waitForBalance = async (priv: bigint, pub: bigint, pending: bigint) => {
            for (let i = 0; i < 20; i++) {
                const balances = {priv: 0n, pub: 0n, pending: 0n};
                for (const [k, v] of await this.page.evaluate(
                    ([propertyId]) =>
                        Object.entries($store.getters["Elysium/aggregatedBalances"][propertyId])
                            .map(([k, v]) => [k, String(v)]),
                    [id]
                )) {
                    balances[k] = stringToBigint(v);
                }

                if (balances.priv === priv && balances.pub === pub && balances.pending === pending)
                    return;
                else
                    await new Promise(r => setTimeout(r, 250));
            }

            assert.fail('Timed out waiting for balance');
        }

        await waitForBalance(0n, creationAmount, 0n);

        await this.page.locator('#anonymize-firo-link').click();
        await this.page.locator('.passphrase-input input[type="password"]').fill(passphrase);
        await this.page.locator('.passphrase-input button.confirm').click();
        await this.page.locator('#popup').waitFor({state: 'hidden', timeout: 100e3});

        await waitForBalance(0n, 0n, creationAmount);
        await this.page.evaluate(() => $daemon.legacyRpc('generate 1'));
        await waitForBalance(creationAmount, 0n, 0n);

        return id;
    }
    it('anonymizes Elysium tokens', <any>testAnonymizesElysiumTokens);

    async function testSendsElysiumTokens(this: This, id: string) {
        const ticker = await this.page.evaluate(([id]) => $store.getters["Elysium/tokenData"][id].ticker, [id]);

        await this.page.locator('a[href="#/send"]').click();
        await this.page.locator('.send-page').waitFor();

        let setSelectedAsset: (id: string) => void;
        await this.page.evaluate(([id]) => setSelectedAsset(id), [id]);

        const recipient = await this.page.evaluate(() => $daemon.getUnusedAddress());
        const satoshiAmountToSend = 100000000n + BigInt(Math.floor(1e8 * Math.random()));
        const amountToSend = bigintToString(satoshiAmountToSend);

        await this.page.locator('#address').fill(recipient);
        await this.page.locator('#amount').fill(amountToSend);

        await this.page.locator('#send-button').click();
        await this.page.locator('.confirm-step button.recommended').click();

        await this.page.locator('input[type="password"]').fill(passphrase);
        await this.page.locator('.passphrase-input button.recommended').click();

        const waitOverlay = this.page.locator('.wait-overlay');
        await waitOverlay.waitFor();
        await waitOverlay.waitFor({state: 'hidden', timeout: 20e3});

        const errorElement = this.page.locator('.error-step .content');
        if (await errorElement.isVisible()) {
            const error = await errorElement.innerText();

            const closeErrorStep = this.page.locator('.error-step button.recommended');
            await closeErrorStep.click();
            await closeErrorStep.waitFor({state: 'hidden'});

            assert.fail(`sending transaction failed: ${error}`);
        }

        await this.page.locator('a[href="#/transactions"]').click();

        let txOut: TXO | undefined;
        for (let i = 0; i < 20; i++) {
            txOut = await this.page.evaluate(
                ([satoshiAmountToSend]) => $store.getters['Transactions/allTXOs'].find(tx =>
                    tx.elysium?.amount === BigInt(satoshiAmountToSend) &&
                    !tx.amount &&
                    !tx.isChange
                ),
                [String(satoshiAmountToSend)]
            );
            if (txOut) break;

            await new Promise(r => setTimeout(r, 250));
        }
        assert(!!txOut, "Timed out waiting for transaction to appear.");

        await this.page.locator('tr:nth-child(1) .amount-value', {hasText: amountToSend}).waitFor();
        await this.page.locator('tr:nth-child(1) .ticker', {hasText: ticker}).waitFor();
    }
    it('sends Elysium tokens', async function () {
        const id = await testAnonymizesElysiumTokens.bind(this)();
        await testSendsElysiumTokens.bind(this)(id);
    });

    it('has private coin control entries that sum to the correct amount', <any>hasCorrectBalance('private'));
    it('has public coin control entries that sum to the correct amount', <any>hasCorrectBalance('public'));

    it('navigates in the debug console', <any>async function (this: This) {
        await this.page.locator('a[href="#/debugconsole"]').click();

        const currentInput = await this.page.locator('#current-input')

        await currentInput.type("garbage-input-1");
        await currentInput.press("Enter");
        while (await currentInput.innerText() !== '')
            await new Promise(r => setTimeout(r, 100));

        await currentInput.type("garbage-input-2");
        await currentInput.press("Enter");
        while (await currentInput.innerText() !== '')
            await new Promise(r => setTimeout(r, 100));

        await currentInput.press("ArrowUp");
        while (await currentInput.innerText() !== 'garbage-input-2')
            await new Promise(r => setTimeout(r, 100));

        await currentInput.press("ArrowUp");
        while (await currentInput.innerText() !== 'garbage-input-1')
            await new Promise(r => setTimeout(r, 100));

        await currentInput.press("ArrowDown");
        while (await currentInput.innerText() !== 'garbage-input-2')
            await new Promise(r => setTimeout(r, 100));

        await currentInput.press("ArrowDown");
        while (await currentInput.innerText() !== '')
            await new Promise(r => setTimeout(r, 100));
    });

    it('properly sends debug commands', <any>async function (this: This) {
        await this.page.locator('a[href="#/debugconsole"]').click();

        const currentInput = await this.page.locator('#current-input');
        for (const [cmd, expectedOutput] of [['getinfo', '"relayfee"'], ['help move', 'Move 0.01 FIRO from the default account']]) {
            await currentInput.type(cmd);
            await currentInput.press("Enter");

            let i = 0;
            while (!(await this.page.locator('.output').allInnerTexts()).find(s => s.includes(expectedOutput))) {
                if (i++ > 100)
                    assert.fail(`expected output of ${cmd} has not appeared in the debug console`);

                await new Promise(r => setTimeout(r, 100));
            }
        }
    });
});