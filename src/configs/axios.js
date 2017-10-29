import axios from 'axios'
import { Loading } from 'quasar'

let loadFunction = config => {
  Loading.show()
  return config
}
let finishFunction = response => {
  Loading.hide()
  return response
}
let errorFunction = error => {
  Loading.hide()
  return Promise.reject(error)
}

const axiosInstanceApi =
  axios.create({ baseURL: 'http://localhost:8889/' })

axiosInstanceApi.interceptors.request.use(loadFunction)

axiosInstanceApi.interceptors.response.use(finishFunction, errorFunction)

let clients = {
  $http: {
    get () {
      return {
        api: axiosInstanceApi
      }
    }
  }
}

export default (Vue) => {
  Object.defineProperties(Vue.prototype, clients)
}
