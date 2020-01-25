import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import settings from './settings'

import {
  Dialog,
  ActionSheet,
  Loading,
  Alert
} from 'quasar'

const apiUrl = settings.apiUrl

Vue.use(Vuex)

let ja = {
  word: '',
  searchingWord: '',
  type: 'normal',
  multiple: false,
  dictionaryList: [],
  audioList: [],
  exampleList: [],
  dictionarySelected: [0],
  audioSelected: [0],
  exampleSelected: [0],
  init: true,
  dictionaryLoading: false,
  audioLoading: false,
  forvoLoading: false,
  noForvo: false,
  exampleLoading: false,
  exampleOffset: 1,
  exampleEnd: false,
  imageLoading: false,
  image: null,
  useImage: false,
  duplicate: null
}

let en = {
  word: '',
  type: 'normal',
  multiple: false,
  dictionaryList: [],
  audioList: [],
  exampleList: [],
  dictionarySelected: [0],
  audioSelected: [0],
  exampleSelected: [0],
  init: true,
  dictionaryLoading: false,
  audioLoading: false,
  noForvo: false,
  exampleLoading: false,
  exampleOffset: 1,
  imageLoading: false,
  image: null,
  useImage: false,
  duplicate: null
}

let state = {
  // jaを複製
  ja: JSON.parse(JSON.stringify(ja)),
  en: JSON.parse(JSON.stringify(en))
}

var htmlToText = (html) => {
  var span = document.createElement('span')
  span.innerHTML = html
  return span.textContent || span.innerText
}

let mutations = {
  // cb：callback関数
  saveJa (state, cb) {
    var ja = state.ja
    var result = {
      word: ja.word
    }
    var save = (update) => {
      var url = 'ja/save'
      var method = 'post'
      // 更新の場合
      if (update) {
        console.log('update')
        url = 'ja/update'
        method = 'put'
      }
      // 新規保存の場合
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
    // 単語は複数の定義がある場合
    // 複数の定義などをマージする処理
    if (state.ja.multiple) {
      if (ja.dictionarySelected.length > 0) {
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
    // 複数じゃない場合
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
      // 単語をマージ
      // 情報を保存しない。参照する単語として保存
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
      // 同じ読み方の単語の有無をチェック
      // ある場合は「duplicated」を返す
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
      // カナを更新する関数。下で使われる
      var modifyKana = (data) => {
        result.kana = data.kana
        checkKana()
      }
      if (state.ja.duplicate) {
        result.id = state.ja.duplicate.id
        Loading.show()
        save(true)
      }
      // ひらがなかカタカナ以外の文字がある場合は修正するように誘導
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
  // 最初の状態に戻す
  resetJa (state) {
    state.ja = JSON.parse(JSON.stringify(ja))
  },
  // 画像検索したい時、掛ける
  searchJaImage (state, cb) {
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
        // useImageがfalseだと保存しない
        state.ja.useImage = true
        cb()
      }
    })
  },
  // 例文を検索
  // Infinite Scrollを対応
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
  // 日本語意味、中国語意味、音声を検索
  // だいたいのコードは2014年に書いたものなので改修したい
  // alternative：代替の単語で検索
  // 例えば：りんご、リンゴ、林檎、苹果
  // skipQuery：重複の単語の有無をチェックしない
  // onlyAudio：音声のみを検索
  searchJa (state, { word, noExample, noAudio, cb, skipQuery, alternative, onlyAudio }) {
    state.ja.init = false
    // console.log('searchJa', word, noExample, noAudio)
    if (onlyAudio) {
      state.ja.word = word
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
      return
    }
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
    if (!noExample) {
      if (alternative) {
        state.ja.exampleOffset = 1
      }
      state.ja.exampleLoading = true
      mutations.searchJaExample(state)
    }
  },

  // cb：callback関数
  saveEn (state, {word, cb}) {
    var en = state.en
    var result = {
      word: word
    }
    Loading.show()
    var save = (update) => {
      var url = 'en/save'
      var method = 'post'
      // 更新の場合
      if (update) {
        console.log('update')
        url = 'en/update'
        method = 'put'
      }
      // 新規保存の場合
      else {
        console.log('save')
        result.type = en.type
      }
      axios({
        method: method,
        url: apiUrl + url,
        data: result
      }).then(response => {
        Loading.hide()
        if (response.data.status === 'success') {
          console.log('save success')
          mutations.resetEn(state)
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
    // 単語は複数の定義がある場合
    // 複数の定義などをマージする処理
    if (state.en.multiple) {
      if (en.dictionarySelected.length > 0) {
        var dictionaryData = en.dictionaryList.filter((e, index) => {
          return en.dictionarySelected.includes(index)
        }).reduce((acc, cur) => {
          acc.meaning += '<div class="duplicate_title">' + (cur.pron ? cur.pron : '') + '</div>'
          acc.meaning += '<div>' + cur.meaning + '</div>'
          acc.pron += (cur.pron || '') + ';'
          return acc
        }, {meaning: '', pron: ''})
        result.meaning = dictionaryData.meaning
        result.pron = dictionaryData.pron.slice(0, -1)
      }
      if (en.audioSelected.length > 0 && en.audioList.length > 0) {
        console.log('xtxt')
        result.audio = en.audioList.filter((a, index) => {
          return en.audioSelected.includes(index)
        }).map((a, index) => {
          return {
            file_name: result.word + (index + 1),
            url: a.url
          }
        })
      }
      else {
        result.audio = en.dictionaryList.filter((a, index) => {
          return en.dictionarySelected.includes(index)
        }).map((a, index) => {
          console.log('audio a', a)
          return {
            file_name: result.word + (index + 1),
            url: a.sound
          }
        })
      }
      if (en.exampleSelected.length > 0) {
        var exampleData = en.exampleList.filter((e, index) => {
          return en.exampleSelected.includes(index)
        }).reduce((acc, cur) => {
          acc.example += '<div>' + cur.sentence + '</div>'
          return acc
        }, {example: ''})
        result.example = exampleData.example
      }
      if (state.en.useImage) {
        result.image = state.en.image
      }
      console.log('multiple', result)
      save()
    }
    // 複数じゃない場合
    else {
      if (en.dictionarySelected.length > 0 && en.dictionaryList.length > 0) {
        var dictionary = en.dictionaryList[en.dictionarySelected[0]]
        if (dictionary.pron && dictionary.pron !== '') {
          result.pron = dictionary.pron
        }
        if (dictionary.meaning && dictionary.meaning !== '') {
          result.meaning = dictionary.meaning
        }
        if (en.audioSelected.length > 0 && en.audioList.length > 0) {
          var audio = en.audioList[en.audioSelected[0]]
          result.audio = audio.url
        }
        else {
          result.audio = dictionary.sound
        }
      }
      if (en.exampleSelected.length > 0 && en.exampleList.length > 0) {
        var example = en.exampleList[en.exampleSelected[0]]
        result.example = example.sentence
      }
      if (state.en.useImage) {
        result.image = state.en.image
      }
      console.log(result)
      if (!result.audio) {
        Loading.hide()
        Dialog.create({
          title: 'No audio. Do it?',
          buttons: [
            'Cancel',
            {
              label: 'Ok',
              handler: () => { Loading.show(); save() }
            }
          ]
        })
      }
      else {
        save()
      }
    }
  },
  // 最初の状態に戻す
  resetEn (state) {
    state.en = JSON.parse(JSON.stringify(en))
  },
  // 画像検索したい時、掛ける
  searchEnImage (state, cb) {
    if (state.en.word === '') {
      return
    }
    state.en.imageLoading = true
    axios.get(apiUrl + 'en/search/image', {
      params: {
        word: state.en.word
      }
    }).then(function (response) {
      state.en.imageLoading = false
      if (response.data.status === 'success') {
        state.en.image = response.data.result
        // useImageがfalseだと保存しない
        state.en.useImage = true
        cb()
      }
    })
  },
  // 例文を検索
  // TODO
  searchEnExample (state) {
    axios.get(apiUrl + 'en/search/example', {
      params: {
        word: state.en.searchingWord
      }
    }).then(function (response) {
      state.en.exampleLoading = false
      if (response.data.status === 'success') {
        state.en.exampleList = response.data.results
      }
    })
  },
  searchEnAudio (state, word) {
    state.en.audioLoading = true
    axios.get(apiUrl + 'en/search/audio/forvo', {
      params: {
        word: word
      }
    }).then(response => {
      state.en.audioLoading = false
      if (response.data.status === 'success') {
        response.data.results.forEach(r => {
          r.type = 'forvo'
        })
        state.en.audioList = state.en.audioList.concat(response.data.results)
      }
    })
  },
  // 日本語意味、音声を検索
  // だいたいのコードは2014年に書いたものなので改修したい
  // skipQuery：重複の単語の有無をチェックしない
  // onlyAudio：音声のみを検索
  searchEn (state, { word, noExample, noAudio, cb, skipQuery, onlyAudio }) {
    state.en.init = false
    if (onlyAudio) {
      mutations.searchEnAudio(state, word)
      return
    }
    if (!skipQuery && state.en.word === '') {
      state.en.word = word
      Loading.show()
      axios.get(apiUrl + 'en/search/query', {
        params: {
          word: word
        }
      }).then(response => {
        Loading.hide()
        if (response.data.status === 'duplicated' || response.data.status === 'need_update') {
          state.en.duplicate = response.data.result
          if (cb) {
            cb()
          }
        }
        else {
          // console.log(mutations, word, noExample, noAudio)
          mutations.searchEn(state, { word: word, noExample: noExample, noAudio: noAudio, cb: null })
        }
      })
      return
    }
    if (skipQuery && state.en.word === '') {
      state.en.word = word
    }
    state.en.searchingWord = word
    state.en.dictionaryLoading = true
    axios.get(apiUrl + 'en/search/meaning', {
      params: {
        word: word
      }
    }).then(function (response) {
      state.en.dictionaryLoading = false
      if (response.data.status === 'success') {
        response.data.results.forEach(r => {
          if (!r.pron) {
            r.pron = ''
          }
          r.meaning = '<div class="meaning">'
          r.definitions.forEach(def => {
            r.meaning += '<div class="definition"><div class="word_type">' + def.word_type + '</div>' // word_type
            r.meaning += '<div class="meanings">'
            def.meanings.forEach(meaning => {
              r.meaning += '<div class="meaning_list"><div class="text">' + meaning.text + '</div>' // text
              if (meaning.example) {
                r.meaning += '<div class="example">' + meaning.example + '</div>' // example
              }
              if (meaning.subs) {
                r.meaning += '<div class="subs">'
                meaning.subs.forEach(sub => {
                  r.meaning += '<div>' + sub + '</div>'
                })
                r.meaning += '</div>' // subs
              }
              r.meaning += '</div>' // meaning_list
            })
            r.meaning += '</div></div>' // meanings, definition
          })
          r.meaning += '</div>' // meaning
        })
        state.en.dictionaryList = state.en.dictionaryList.concat(response.data.results)
      }
    })
    if (!noExample) {
      state.en.exampleLoading = true
      mutations.searchEnExample(state)
    }
  }
}

let getters = {
  ja () {
    return state.ja
  },
  en () {
    return state.en
  }
}

export default new Vuex.Store({
  state,
  mutations,
  getters
})
