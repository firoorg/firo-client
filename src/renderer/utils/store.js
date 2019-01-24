
export const addVuexModel = ({ name, getter: getterName, action: actionName, namespace }) => {
    const namespaced = namespace ? `${namespace}/` : ''
    const getter = getterName || name
    const action = actionName || name

    return {
        [name]: {
            get () {
                return this.$store.getters[namespaced + getter]
            },
            set (value) {
                this.$store.dispatch(namespaced + action, value)
            }
        }
    }
}
