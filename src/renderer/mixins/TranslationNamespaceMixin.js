export default {
    props: {
        translationNamespace: {
            type: String,
            required: true
        },
        translationMode: {
            type: String,
            default: 'singular'
        },
        translationPluralCount: {
            type: Number,
            default: 1
        }
    },

    computed: {
        translationIsSingular () {
            return this.translationMode === 'singular'
        },

        translationIsPlural () {
            return this.translationMode === 'plural'
        }
    }
}
