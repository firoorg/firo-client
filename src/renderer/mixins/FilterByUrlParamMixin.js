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
            return (list, keysToFilter) => {
                if (!this.urlFilter) {
                    return list
                }

                const filter = this.urlFilter.toLowerCase()

                return list.filter((item) => {
                    for (let key of keysToFilter) {
                        if (!item[key]) {
                            continue
                        }

                        const lower = item[key].toLowerCase()

                        if (lower.includes(filter)) {
                            return true
                        }
                    }

                    return false
                })
            }
        }
    },

    methods: {
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
