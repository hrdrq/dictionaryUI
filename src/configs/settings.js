const typeOptions = [
  {text: '普通', value: 'normal'},
  {text: 'IT', value: 'IT'},
  {text: '名前', value: 'name'}
]

// 本番： apiUrl = '/'
// 開発環境： apiUrl = 'http://localhost:8889/'
const apiUrl = process.env.API_URL

export default {
  typeOptions,
  apiUrl
}
