<template>
    <div>
        <h2>
            <slot />
        </h2>
        <div class="edit-actions">
            <base-popover
                :open.sync="isOpen"
                placement="left"
                :auto-hide="true"
                popover-class="notice"
                @apply-show="() => resetAndSelectInput = true"
                @hide="() => resetAndSelectInput = false"
            >
                <template slot="content">
                    <editable-label-popover-content
                        :label="label"
                        :reset-label-and-select-input="resetAndSelectInput"
                        @submit="onSubmitForm"
                    />
                </template>

                <template slot="target">
                    <base-round-button
                        color="light"
                        size="large"
                        :is-active="isOpen"
                    >
                        <!-- todo update icon and animate success error state -->
                        <edit-icon />
                    </base-round-button>
                </template>
            </base-popover>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import types from '~/types'

import TickIcon from '@/components/Icons/TickIcon'
import LoadingBounce from '@/components/Icons/LoadingBounce'
import EditableLabelPopoverContent from './EditableLabelPopoverContent'
import EditIcon from '@/components/Icons/EditIcon'

export default {
    name: 'EditableLabel',
    components: {
        EditIcon,
        LoadingBounce,
        EditableLabelPopoverContent,
        TickIcon
    },

    props: {
        label: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            isOpen: false,
            resetAndSelectInput: false,
            sentLabel: false
        }
    },

    computed: {
        ...mapGetters({
            isLoading: 'PaymentRequest/isLoading'
        })
    },

    methods: {
        ...mapActions({
        }),

        onSubmitForm({ label }) {
            this.$emit('submit', { label })
            this.sentLabel = true
            this.isOpen = false
        }
    }
}
</script>

<style lang="scss" scoped>
    div {
        //display: flex;
        position: relative;

        h2 {
            max-width: 90%;
            // border: 1px solid red;
        }
    }

    .edit-actions {
        position: absolute;
        right: 0;
        //top: emRhythm(1);
        top: 0;
    }

    input {
        @include dark-input()
    }
</style>
