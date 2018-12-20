import Vue from 'vue'

let instances = {}

export const getEventBus = function (name) {
    const lowerName = name.toLowerCase()

    if (!instances[lowerName]) {
        instances[lowerName] = new Vue()
    }

    return instances[lowerName]
}
