<template>
    <div class="info-popup">
        <div class="title">Coin Swap Chain</div>

        <div class="content">
                <vue-select
                    class="select"
                    label="chain"
                    v-model="selectedValue"
                    :options="chainOptions"
                    :placeholder="'Select Chain'"
                >
                    <template v-slot:option="option">
                        <div class="coin-option">
                            <div class="coin-name">{{ option.chain }}</div>
                        </div>
                    </template>

                    <template v-slot:selected-option="option">
                        <div class="coin-option" v-if="option">
                            <div class="coin-name">{{ option.chain }}</div>
                        </div>
                    </template>
                </vue-select>
        </div>

        <div class="buttons">
            <button v-if="showCancel" class="solid-button unrecommended" @click="$emit('cancel')">
                Cancel
            </button>

            <button class="solid-button recommended" @click="$emit('confirm', '100000', '222')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: cancel, confirm
import { convertToCoin } from 'lib/convert'
import Amount from "renderer/components/shared/Amount";
import { VueSelect } from 'vue-select';

export default {
    name: 'CoinSwapChain',

    components: {
        
        VueSelect,
        Amount
    },

    props: {
        chainOptions: {
            type: Array,
            required: true
        },
        selectedChain: {
            type: String,
            required: true
        },
        // Should we show the cancel button?
        showCancel: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            selectedValue: this.selectedChain
        }
    },

    mounted() {
        
        
    },

    computed: {
        
    },

    methods: {
        convertToCoin,

        
    }
}
</script>

<style scoped lang="scss">

.exchange-address {
    text-align: center;

    margin: {
        top: var(--padding-base);
        bottom: var(--padding-base);
    }
}
.inner-popup{
    .content{
        min-height:80px;
    }
}
</style>
