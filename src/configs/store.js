import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import settings from './settings'

import {
  Dialog,
  ActionSheet,
  // Toast,
  Loading,
  Alert
} from 'quasar'

const apiUrl = settings.apiUrl
// const apiUrl = 'http://54.65.181.140:8889/'

Vue.use(Vuex)

let ja = {
  word: '',
  searchingWord: '',
  type: 'normal',
  multiple: false,
  dictionaryList: [],
  audioList: [],
  chineseList: [],
  exampleList: [],
  dictionarySelected: [0],
  audioSelected: [0],
  chineseSelected: [0],
  exampleSelected: [0],
  init: true,
  dictionaryLoading: false,
  audioLoading: false,
  forvoLoading: false,
  noForvo: false,
  chineseLoading: false,
  exampleLoading: false,
  exampleOffset: 1,
  exampleEnd: false,
  imageLoading: false,
  image: null,
  useImage: false,
  duplicate: null
}

let state = {
  ja: JSON.parse(JSON.stringify(ja))
}

var htmlToText = (html) => {
  var span = document.createElement('span')
  span.innerHTML = html
  return span.textContent || span.innerText
}

let mutations = {
  saveJa (state, cb) {
    var ja = state.ja
    var result = {
      word: ja.word
    }
    var save = (update) => {
      var url = 'ja/save'
      var method = 'post'
      if (update) {
        console.log('update')
        url = 'ja/update'
        method = 'put'
      }
      else {
        console.log('save')
        result.type = ja.type
      }
      axios({
        method: method,
        url: apiUrl + url,
        data: result
      }).then(response => {
        Loading.hide()
        if (response.data.status === 'success') {
          console.log('save success')
          mutations.resetJa(state)
          if (cb) {
            cb()
          }
        }
        else {
          Alert.create({
            enter: 'bounceInRight',
            leave: 'bounceOutRight',
            color: 'positive',
            icon: 'wifi',
            html: update ? `更新失敗しました` : `保存失敗しました`,
            position: 'top-right',
            actions: [
              {
                label: 'Snooze',
                handler () {
                  console.log('acting')
                }
              },
              {
                label: 'Abort',
                handler () {
                  console.log('aborting')
                }
              }
            ]
          })
        }
      })
    }
    if (state.ja.multiple) {
      if (ja.dictionarySelected.length > 0) {
        // var dictionary = ja.dictionaryList[ja.dictionarySelected[0]]
        // if (dictionary.kana && dictionary.kana !== '') {
        //   result.kana = dictionary.kana
        // }
        // if (dictionary.accent && dictionary.accent.length > 0) {
        //   result.accent = dictionary.accent.join(',')
        // }
        // if (dictionary.gogen && dictionary.gogen !== '') {
        //   result.gogen = dictionary.gogen
        // }
        // if (dictionary.meaning && dictionary.meaning !== '') {
        //   result.meaning = dictionary.meaning
        // }
        var dictionaryData = ja.dictionaryList.filter((e, index) => {
          return ja.dictionarySelected.includes(index)
        }).reduce((acc, cur) => {
          acc.meaning += '<div class="duplicate_title">' + (cur.kana ? cur.kana : '') + ' ' + (cur.accent ? cur.accent : '') + ' ' + (cur.gogen ? cur.gogen : '') + '</div>'
          acc.meaning += '<div>' + cur.meaning + '</div>'
          acc.kana += (cur.kana || '') + ';'
          acc.accent += cur.accent.join(',') + ';'
          acc.gogen += (cur.gogen || '') + ';'
          return acc
        }, {meaning: '', kana: '', accent: '', gogen: ''})
        result.meaning = dictionaryData.meaning
        result.kana = dictionaryData.kana.slice(0, -1)
        result.accent = dictionaryData.accent.slice(0, -1)
        result.gogen = (dictionaryData.gogen.search(/[^;]/) > -1) ? dictionaryData.gogen : null
      }
      if (ja.audioSelected.length > 0) {
        result.audio = ja.audioList.filter((a, index) => {
          return ja.audioSelected.includes(index)
        }).map((a, index) => {
          return {
            file_name: result.word + (index + 1),
            url: a.url
          }
        })
      }
      if (ja.chineseSelected.length > 0) {
        // var chinese = ja.chineseList[ja.chineseSelected[0]]
        // result.chinese = chinese.meaning
        result.chinese = ja.chineseList.filter((e, index) => {
          return ja.chineseSelected.includes(index)
        }).reduce((acc, cur) => {
          acc += '<div class="duplicate_title">' + cur.kana + '</div>'
          acc += '<div>' + cur.meaning + '</div>'
          return acc
        }, '')
      }
      if (ja.exampleSelected.length > 0) {
        var exampleData = ja.exampleList.filter((e, index) => {
          return ja.exampleSelected.includes(index)
        }).reduce((acc, cur) => {
          acc.example += '<div>' + cur.sentence + '</div>'
          acc.listening_hint += '<div>' + cur.listening_hint + '</div>'
          return acc
        }, {example: '', listening_hint: ''})
        result.example = exampleData.example
        result.listening_hint = exampleData.listening_hint
        // result.listening_hint = ja.exampleList.filter((e, index) => {
        //   return ja.exampleSelected.includes(index)
        // }).reduce((acc, cur) => {
        //   acc += '<div>' + cur.listening_hint + '</div>'
        //   return acc
        // }, '')
        var extractedList = ja.exampleList.filter((e, index) => {
          return !ja.exampleSelected.includes(index)
        })
        result.examples = extractedList.slice(0, 10).reduce((acc, cur, i) => {
          acc += '<p>' + cur.sentence + '</p>'
          return acc
        }, '')
      }
      if (state.ja.useImage) {
        result.image = state.ja.image
      }
      console.log('multiple', result)
      save()
    }
    else {
      if (ja.dictionarySelected.length > 0 && ja.dictionaryList.length > 0) {
        var dictionary = ja.dictionaryList[ja.dictionarySelected[0]]
        if (dictionary.kana && dictionary.kana !== '') {
          result.kana = dictionary.kana
        }
        if (dictionary.accent && dictionary.accent.length > 0) {
          result.accent = dictionary.accent.join(',')
        }
        if (dictionary.gogen && dictionary.gogen !== '') {
          result.gogen = dictionary.gogen
        }
        if (dictionary.meaning && dictionary.meaning !== '') {
          result.meaning = dictionary.meaning
        }
      }
      if (ja.audioSelected.length > 0 && ja.audioList.length > 0) {
        var audio = ja.audioList[ja.audioSelected[0]]
        result.audio = audio.url
      }
      if (ja.chineseSelected.length > 0 && ja.chineseList.length > 0) {
        var chinese = ja.chineseList[ja.chineseSelected[0]]
        result.chinese = chinese.meaning
      }
      if (ja.exampleSelected.length > 0 && ja.exampleList.length > 0) {
        var example = ja.exampleList[ja.exampleSelected[0]]
        result.example = example.sentence
        result.listening_hint = example.listening_hint
        extractedList = ja.exampleList.filter((e, index) => {
          return index !== ja.exampleSelected[0]
        })
        result.examples = extractedList.slice(0, 10).reduce((acc, cur, i) => {
          acc += '<p>' + cur.sentence + '</p>'
          return acc
        }, '')
      }
      if (state.ja.useImage) {
        result.image = state.ja.image
      }
      console.log(result)
      var merge = (word, detailId) => {
        axios.post(apiUrl + 'ja/save/add-alternative-word', {
          word: word,
          detail_id: detailId
        }).then(response => {
          Loading.hide()
          if (response.status !== 200 || response.data.status !== 'success') {
            Alert.create({
              enter: 'bounceInRight',
              leave: 'bounceOutRight',
              color: 'positive',
              icon: 'wifi',
              html: `マージ失敗しました`,
              position: 'top-right',
              actions: [
                {
                  label: 'Snooze',
                  handler () {
                    console.log('acting')
                  }
                },
                {
                  label: 'Abort',
                  handler () {
                    console.log('aborting')
                  }
                }
              ]
            })
          }
          else {
            console.log('merge success')
            mutations.resetJa(state)
            if (cb) {
              cb()
            }
          }
        })
      }
      var checkKana = () => {
        Loading.show()
        axios.get(apiUrl + 'ja/save/query', {
          params: {
            kana: result.kana
          }
        }).then(response => {
          if (response.data.status === 'duplicated') {
            Loading.hide()
            var results = response.data.results
            var actions = results.map((r) => {
              return {
                label: r.word + '：' + htmlToText(r.meaning),
                icon: 'file download',
                handler () {
                  Loading.show()
                  console.log(result.word, r.detail_id)
                  merge(result.word, r.detail_id)
                }
              }
            })
            actions.unshift({
              label: '新規登録',
              icon: 'add',
              handler () {
                Loading.show()
                save()
              }
            })
            ActionSheet.create({
              title: 'マージする？',
              actions: actions
            })
          }
          else {
            save()
          }
        })
      }
      var modifyKana = (data) => {
        // console.log('update', result.kana, data.kana)
        result.kana = data.kana
        checkKana()
      }
      if (state.ja.duplicate) {
        result.id = state.ja.duplicate.id
        Loading.show()
        save(true)
      }
      else {
        if (!result.kana || result.kana === '' || result.kana.match(/[一-龠]/)) {
          Dialog.create({
            title: 'カナ修正',
            form: {
              kana: {
                type: 'text',
                model: result.kana
              }
            },
            buttons: [
              'Cancel',
              {
                label: 'Ok',
                handler: modifyKana
              }
            ]
          })
        }
        else {
          checkKana()
        }
      }
    }
  },
  resetJa (state) {
    state.ja = JSON.parse(JSON.stringify(ja))
  },
  searchImage (state) {
    if (state.ja.word === '') {
      return
    }
    state.ja.imageLoading = true
    axios.get(apiUrl + 'ja/search/image', {
      params: {
        word: state.ja.word
      }
    }).then(function (response) {
      state.ja.imageLoading = false
      if (response.data.status === 'success') {
        state.ja.image = response.data.result
        state.ja.useImage = true
      }
    })
  },
  searchJaExample (state, cb) {
    if (state.ja.searchingWord === '') {
      if (cb) {
        cb()
      }
      return
    }
    axios.get(apiUrl + 'ja/search/example', {
      params: {
        word: state.ja.searchingWord,
        offset: state.ja.exampleOffset
      }
    }).then(function (response) {
      state.ja.exampleLoading = false
      if (response.data.status === 'success') {
        state.ja.exampleList = state.ja.exampleList.concat(response.data.results)
        if (response.data.type !== 'yourei') {
          state.ja.exampleEnd = true
        }
        else {
          state.ja.exampleOffset += 20
        }
      }
      else {
        state.ja.exampleEnd = true
      }
      if (cb) {
        cb()
      }
    })
  },
  searchJa (state, { word, noExample, noAudio, cb, skipQuery, alternative }) {
    state.ja.init = false
    // console.log('searchJa', word, noExample, noAudio)
    if (!skipQuery && state.ja.word === '') {
      state.ja.word = word
      Loading.show()
      axios.get(apiUrl + 'ja/search/query', {
        params: {
          word: word
        }
      }).then(response => {
        Loading.hide()
        if (response.data.status === 'duplicated' || response.data.status === 'need_update') {
          state.ja.duplicate = response.data.result
          if (cb) {
            cb()
          }
        }
        else {
          // console.log(mutations, word, noExample, noAudio)
          mutations.searchJa(state, { word: word, noExample: noExample, noAudio: noAudio, cb: null })
        }
      })
      return
    }
    if (skipQuery && state.ja.word === '') {
      state.ja.word = word
    }
    state.ja.searchingWord = word
    state.ja.dictionaryLoading = true
    state.ja.chineseLoading = true
    axios.get(apiUrl + 'ja/search/meaning', {
      params: {
        word: word
      }
    }).then(function (response) {
      state.ja.dictionaryLoading = false
      if (response.data.status === 'success') {
        response.data.results.forEach(r => {
          if (!r.kana) {
            r.kana = ''
          }
          if (!r.accent) {
            r.accent = []
          }
          else {
            r.accent = r.accent.split(',')
          }
          if (!r.gogen) {
            r.gogen = ''
          }
        })
        state.ja.dictionaryList = state.ja.dictionaryList.concat(response.data.results)
      }
    })
    if (!noAudio) {
      state.ja.audioLoading = true
      state.ja.forvoLoading = true
      axios.get(apiUrl + 'ja/search/audio/naver', {
        params: {
          word: word
        }
      }).then(response => {
        state.ja.audioLoading = false
        if (response.data.status === 'success') {
          response.data.results.forEach(r => {
            r.type = 'naver'
          })
          state.ja.audioList = state.ja.audioList.concat(response.data.results)
        }
      })
      axios.get(apiUrl + 'ja/search/audio/forvo', {
        params: {
          word: word
        }
      }).then(response => {
        state.ja.audioLoading = false
        state.ja.forvoLoading = false
        if (response.data.status === 'success') {
          response.data.results.forEach(r => {
            r.type = 'forvo'
          })
          state.ja.audioList = state.ja.audioList.concat(response.data.results)
        }
        else {
          state.ja.noForvo = true
        }
      })
    }
    axios.get(apiUrl + 'ja/search/chinese', {
      params: {
        word: word
      }
    }).then(function (response) {
      state.ja.chineseLoading = false
      if (response.data.status === 'success') {
        state.ja.chineseList = state.ja.chineseList.concat(response.data.results)
      }
    })
    if (!noExample) {
      if (alternative) {
        state.ja.exampleOffset = 1
      }
      state.ja.exampleLoading = true
      mutations.searchJaExample(state)
    }
  }
}

let getters = {
  ja () {
    return state.ja
  }
}

export default new Vuex.Store({
  state,
  mutations,
  getters
})
