import axios from 'axios'

const addAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// 普通请求：10 秒超时
const api = addAuthInterceptor(
  axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })
)

// 文件上传专用：120 秒超时，不设全局 Content-Type（由 FormData 自动带 multipart）
export const uploadApi = addAuthInterceptor(
  axios.create({
    baseURL: '/api',
    timeout: 120000,
  })
)

export default api
