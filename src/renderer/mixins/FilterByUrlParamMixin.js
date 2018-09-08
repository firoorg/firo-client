export default {

    computed: {
        urlFilter: {
            get () {
                try {
                    const { filter } = this.$store.state.AppRouter.query

                    return filter
                } catch (e) {
                    console.error(e)
                    return ''
                }
            },

            set (newValue) {
                const route = {
                    name: this.$router.currentRoute.name
                }

                if (!newValue) {
                    this.$router.replace(route)
                    return
                }

                this.$router.replace({
                    ...route,
                    query: {
                        filter: newValue
                    }
                })
            }
        },

        getFilteredByUrl () {
            return (list, keyToFilter) => {
                if (!this.urlFilter) {
                    return list
                }

                const filter = this.urlFilter.toLowerCase()

                return list.filter((item) => {
                    return item[keyToFilter] ? item[keyToFilter].toLowerCase().includes(filter) : false
                })
            }
        },

        pushRouterWithFilter (data) {
            this.$router.push({
                ...data,
                query: {
                    ...data.query,
                    filter: this.urlFilter
                }
            })
        }
    }

}
