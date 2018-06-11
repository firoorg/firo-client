<script>
    import { mapGetters } from 'vuex'

    export default {
        name: 'notification-center',
        computed: {
            ...mapGetters({
                message: 'Notification/lastMessage',
                notification: 'Notification/lastNotification'
            })
        },
        watch: {
            message (message) {
                this.$message(message.message)
            },
            notification (notification) {
                const {type, title, message} = notification

                this.$notify({
                    type,
                    title,
                    message
                })
            }
        },
        render: function (h) {
            return h() // don't need to render anything. avoiding warning message
        }
    }
</script>