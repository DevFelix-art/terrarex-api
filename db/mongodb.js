import mongoose from 'mongoose'

const { Schema, connect, model: _model } = mongoose
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true }

export class mongoDB {
  constructor(url, options = defaultOptions) {

    this.url = url
    this.options = options
    this.data = this._data = {}
    this._schema = {}
    this._model = {}
    this.db = connect(this.url, { ...this.options }).catch(console.error)
  }
  async read() {
    this.conn = await this.db
    let schema = this._schema = new Schema({
      data: {
        type: Object,
        required: true, 
        default: {}
      }
    })
    try { this._model = _model('data', schema) } catch { this._model = _model('data') }
    this._data = await this._model.findOne({})
    if (!this._data) {
      this.data = {}
      const [_, _data] = await Promise.all([
        this.write(this.data),
        this._model.findOne({})
      ])
      this._data = _data
    } else this.data = this._data.data
    return this.data
  }

  write(data) {
    return new Promise(async (resolve, reject) => {
      if (!data) return reject(data)
      if (!this._data) return resolve((new this._model({ data })).save())
      this._model.findById(this._data._id, (err, docs) => {
        if (err) return reject(err)
        if (!docs.data) docs.data = {}
        docs.data = data
        this.data = {}
        return docs.save(resolve)
      })
    })
  }
}