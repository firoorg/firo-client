
export const addVuexModel = ({ name, getter: getterName, action: actionName, namespace }) => {
    const namespaced = namespace ? `${namespace}/` : ''
    const getter = getterName || name
    const action = actionName || name

    return {
        [name]: {
            get () {
                console.log(this.$store.getters)
                return this.$store.getters[namespaced + getter]
            },
            set (value) {
                this.$store.dispatch(namespaced + action, value)
            }
        }
    }
}
