import axios from 'axios'

const api = axios.create({ withCredentials: true })
const s3 = axios.create({ withCredentials: true })
api.defaults.headers = { 'Cache-Control': 'no-cache'}
export { api, s3 }
