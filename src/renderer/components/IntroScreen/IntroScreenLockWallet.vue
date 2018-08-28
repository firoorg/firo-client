<template>
    <div>
        <h1>Secure your funds!</h1>

        <template v-if="!showConfirm">
            <p>Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla.</p>

            <div class="form">
                <div class="control passphrase">
                    <input type="text"
                           placeholder="Enter Passphrase"
                           v-model="passphrase" />
                    <div>
                        <base-button v-if="!passphrase"
                                     color="comet">
                            Generate Passphrase
                        </base-button>
                    </div>
                </div>
            </div>

            <footer>
                <base-button color="green"
                             :disabled="!passphrase"
                             @click="goToConfirm">
                    Confirm Passphrase
                </base-button>
            </footer>
        </template>

        <template v-else-if="!isConfirmed">
            <p>Nullam id dolor id nibh ultricies vehicula ut id elit.</p>

            <div class="form">
                <div class="control confirm">
                    <input type="text"
                           placeholder="Confirm Passphrase"
                           v-model="confirm" />
                </div>
            </div>

            <footer>
                <base-button is-outline
                             @click="() => this.showConfirm = false">
                    Go Back
                </base-button>
                <base-button :disabled="!isEqual"
                            color="green"
                            @click="onConfirm">
                    Set Passphrase
                </base-button>
            </footer>
        </template>
        <template v-else>
            <h2>warning lose all of your coins! old backup useless.<br/>
                change background to green</h2>

            <footer>
                <base-button color="red"
                             is-outline
                             @click="actions.prev">
                    No, create new passphrase
                </base-button>
                <base-button color="green"
                             @click="actions.next">
                    Ok, go ahead!
                </base-button>
            </footer>
        </template>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import GuideStepMixin from '@/mixins/GuideStepMixin'

    export default {
        name: 'IntroScreenLockWallet',
        mixins: [
            GuideStepMixin
        ],
        data () {
            return {
                passphrase: null,
                confirm: null,
                showConfirm: false,
                isConfirmed: false
            }
        },
        computed: {
            ...mapGetters({
                isLocked: 'App/isLocked'
            }),
            isEqual () {
                return this.passphrase === this.confirm
            }
        },
        methods: {
            goToConfirm () {
                this.showConfirm = true
                this.confirm = null
            },
            onConfirm () {
                this.isConfirmed = true
            },
            isEnabled () {
                return !this.isLocked
            }
        }
    }
</script>

<style lang="scss" scoped>
    .form {
        margin-top: emRhythm(7);
    }
    .form .control input {
        // @include green-input();
    }

    .form .control.passphrase {
        display: flex;
        padding-right: 0;

    }

    .form .control.passphrase input[type="text"] {
        flex-grow: 1;
        width: 1%;
    }
</style>