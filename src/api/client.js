import api from './axios'
import {handle} from './mockServer'

const USE_MOCK = !import.meta.env.VITE_API_URL
const LATENCY_MS = 180

// Token managment helpers
export const getToken = () => localStorage.getItem('token')
export const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token)
    } else {
        localStorage.removeItem('token')
    }
}

export async function request(method, path, {query, body, signal} = {}) {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                try {
                    resolve(handle(method, path, {query, body}))
                } catch (error) {
                    reject(error)
                }
            }, LATENCY_MS)
            signal?.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new DOMException('Aborted', 'AbortError'))
            })
        })
    }

    try {
        const response = await api({
            method,
            url: path,
            params: query,
            data: body,
            signal,
        })
        return response.data
    } catch (error) {
        const err = new Error(error.response?.data?.message || 'Request failed')
        err.status = error.response?.status
        err.payload = error.response?.data
        throw err
    }

}

export const get = (path, query, opts) => request('GET', path, { query, ...opts })
export const post = (path, body, opts) => request('POST', path, { body, ...opts })
export const put = (path, body, opts) => request('PUT', path, { body, ...opts })
export const patch = (path, body, opts) => request('PATCH', path, { body, ...opts })
export const del = (path, opts) => request('DELETE', path, opts)
