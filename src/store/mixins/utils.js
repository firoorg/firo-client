import { ucFirst } from '#/lib/utils'
import { camelCase, snakeCase } from 'lodash'

export const getName = (namespace) => {
    const name = camelCase(namespace)
    const Name = ucFirst(name)
    const NAME = snakeCase(namespace).toUpperCase()

    return {
        name,
        Name,
        NAME
    }
}
