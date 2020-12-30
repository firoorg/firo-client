import axios from 'axios';

class Http {
    headers = {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };

    async get({ url, options = {}, headers = {} }) {
        return this._callRequest('get', url, options, headers);
    }

    async post({ url, options = {}, headers = {} }) {
        return this._callRequest('post', url, options, headers);
    }

    async put({ url, options = {}, headers = {} }) {
        return this._callRequest('put', url, options, headers);
    }

    async delete({ url, options = {}, headers = {} }) {
        return this._callRequest('delete', url, options, headers);
    }

    async _callRequest(method, url, options, headers) {
        return new Promise((resolve, reject) => {
            axios({
                url,
                method,
                headers: {
                    ...this.headers,
                    ...headers
                },
                ...options,
                validateStatus(status) {
                    return status >= 200 && status < 500;
                }
            })
                .then(response => {
                    return resolve(response.data);
                })
                .catch(error => {
                    return reject(error);
                });
        });
    }
}

export default new Http();
