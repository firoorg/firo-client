<template>
    <div
        v-if="!isLoading"
        class="status"
    >
        <!--<h1 v-if="isLoading">Loading</h1>-->
        <template v-if="isError">
            <div class="icon">
                <send-error />
            </div>
            <h2>An Error occurred!</h2>
            <p>{{ error.message }}</p>
            <em>code {{ error.code }}</em>
        </template>
        <template v-else-if="isValid">
            <div class="icon">
                <component :is="successIconComponentName" />
            </div>
            <h2>{{ $t(`${translationNamespace}.title`) }}</h2>
            <p v-if="translationIsPlural">
                {{ $tc(`${translationNamespace}.description`, translationPluralCount) }}
            </p>
            <p v-else>
                {{ $t(`${translationNamespace}.description`) }}
            </p>
        </template>
    </div>
</template>

<script>
// import AutoCloseMixin from '@/mixins/AutoCloseMixin'
import TranslationNamespaceMixin from '@/mixins/TranslationNamespaceMixin'

import SendError from '@/components/Icons/SendError'
import SuccessfullySend from '@/components/Icons/SucessfullySend'
import MintStarted from '@/components/Icons/MintStarted'

export default {
    name: 'StepResponseStatus',

    components: {
        SendError,
        SuccessfullySend,
        MintStarted
    },

    mixins: [
        // AutoCloseMixin,
        TranslationNamespaceMixin
    ],

    props: {
        successIconComponentName: {
            type: String,
            default: 'SuccessfullySend'
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        isValid: {
            type: Boolean,
            default: false
        },
        isError: {
            type: Boolean,
            default: false
        },
        error: {
            type: Object
        }
    }
}
</script>

<style lang="scss" scoped>
    .icon {
        max-width: emRhythm(13);
        margin: 0 auto emRhythm(2);

        & + h2 {
            margin-bottom: 0;
        }
    }

    .status {
        text-align: center;

        p:last-child {
            margin-bottom: 0;
        }
    }
</style>
