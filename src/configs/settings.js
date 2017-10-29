const typeOptions = [
  {text: '普通', value: 'normal'},
  {text: 'IT', value: 'IT'},
  {text: '名前', value: 'name'}
]

// const apiUrl = '/'
// const apiUrl = 'http://localhost:8889/'
const apiUrl = process.env.API_URL

export default {
  typeOptions,
  apiUrl
}
