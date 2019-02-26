export default {
    props: {
        color: {
            type: String,
            default: 'green'
        }
    },

    computed: {
        strokeColor () {
            switch (this.color.toLowerCase()) {
            case 'white':
                return '#fff'
            case 'warning':
            case 'orange':
            case 'public':
                return '#FA8C0F'
            case 'success':
            case 'green':
            case 'private':
            default:
                return '#23b852'
            }
        }
    }
}
