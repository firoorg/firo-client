export default {
    methods: {
        addCategoryTagToLabel(rowData) {
            const {label: value, category} = rowData
            const label = value || this.$t('send.table__outgoing-payments.label__tx-nolabel')
            let catLabel = ''

            if (category === 'send') {
                catLabel = `#${this.$t('send.table__outgoing-payments.label__tx-category-send')}`
            } else if (category === 'spendOut') {
                catLabel = `#${this.$t('send.table__outgoing-payments.label__tx-category-spendOut')}`
            }

            if (label.includes(catLabel)) {
                return label
            }

            return `${label} ${catLabel}`
        }
    }
}
