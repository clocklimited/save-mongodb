const emptyFn = () => {}
const { ObjectId } = require('mongodb')
const through = require('through2')
const es = require('event-stream')
const createCastIdProperty = require('./cast-id-property')

function createEngine(collection, engineOptions) {
  const self = es.map(createOrUpdate)
  const options = Object.assign({}, { idProperty: '_id' }, engineOptions)
  const castIdProperty = createCastIdProperty(options.idProperty)

  function create(object, callback = emptyFn) {
    // if id is any falsy consider it empty
    if (!object[options.idProperty]) {
      delete object[options.idProperty]
    }
    self.emit('create', object)
    const entity = Object.assign({}, object)

    collection
      .insertOne(entity)
      .then(res => {
        entity[options.idProperty] = res.insertedId
        const data = objectIdToString(entity)
        self.emit('afterCreate', data)
        self.emit('received', data)
        callback(null, data)
      })
      .catch(error => {
        callback(error)
      })
  }

  function createOrUpdate(object, callback) {
    if (typeof object[options.idProperty] === 'undefined') {
      // Create a new object
      self.create(object, callback)
    } else {
      // Try and find the object first to update
      self.read(object[options.idProperty], (err, entity) => {
        if (err) return callback(err)
        if (entity) {
          // We found the object so update
          self.update(object, callback)
        } else {
          // We didn't find the object so create
          self.create(object, callback)
        }
      })
    }
  }

  function read(id, callback = emptyFn) {
    const query = {}
    query[options.idProperty] = id

    self.emit('read', id)

    collection
      .findOne(castIdProperty(query))
      .then(entity => {
        const data = entity === null ? undefined : objectIdToString(entity)
        self.emit('received', data)
        callback(null, data)
      })
      .catch(error => {
        callback(error)
      })
  }

  function update(object, overwrite, callback) {
    if (typeof overwrite === 'function') {
      callback = overwrite
      overwrite = false
    }

    self.emit('update', object, overwrite)
    callback = callback || emptyFn
    const query = {}
    const updateObject = Object.assign({}, object)
    const updateData = overwrite ? updateObject : { $set: updateObject }
    const updateFunction = overwrite ? 'findOneAndReplace' : 'findOneAndUpdate'
    const id = object[options.idProperty]

    if (id === undefined || id === null) {
      return callback(
        new Error(`Object has no '${options.idProperty}' property`)
      )
    }

    query[options.idProperty] = id
    delete updateObject[options.idProperty]

    const typedId = castIdProperty(query)

    collection[updateFunction](typedId, updateData, {
      returnDocument: 'after',
      sort: { _id: 1 }
    })
      .then(res => {
        if (res === null || res.value === null) {
          throw new Error(
            `No object found with '${options.idProperty}' = '${id}'`
          )
        }
        // Handle both old and new response formats
        const resultValue = res.value || res
        const entity = objectIdToString(resultValue)
        self.emit('afterUpdate', entity)
        self.emit('received', entity)
        callback(null, entity)
      })
      .catch(error => {
        callback(error)
      })
  }

  function updateMany(query, object, callback = emptyFn) {
    self.emit('updateMany', query, object)

    collection
      .updateMany(query, { $set: object }, { upsert: false })
      .then(result => {
        self.emit('afterUpdateMany', query, object)
        self.emit('received', object)
        callback(null, result)
      })
      .catch(error => {
        callback(error)
      })
  }

  function deleteMany(query, callback = emptyFn) {
    self.emit('deleteMany', query)

    collection
      .deleteMany(castIdProperty(query))
      .then(result => {
        self.emit('afterDeleteMany', query)
        callback(null, result)
      })
      .catch(error => {
        callback(error)
      })
  }

  /**
   * Deletes one object. Returns an error if the object can not be found
   * or if the ID property is not present.
   *
   * @param {Object} object to delete
   * @param {Function} callback
   * @api public
   */
  function del(id, callback = emptyFn) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function or empty')
    }

    self.emit('delete', id)
    const query = {}

    query[options.idProperty] = id

    collection
      .deleteOne(castIdProperty(query))
      .then(result => {
        self.emit('afterDelete', id)
        callback(undefined, result)
      })
      .catch(error => {
        callback(error)
      })
  }

  // Because your application using save shouldn't know about engine internals
  // ObjectId must be converted to strings before returning.
  function objectIdToString(entity) {
    if (entity && entity[options.idProperty]) {
      entity[options.idProperty] = entity[options.idProperty].toString()
    }
    return entity
  }

  function find(query, saveOptions, callback) {
    if (typeof saveOptions === 'function') {
      callback = saveOptions
      saveOptions = {}
    }

    if (saveOptions === undefined) {
      saveOptions = {}
    }
    const findOptions = Object.assign({}, saveOptions)

    if (findOptions.fields) {
      findOptions.projection = findOptions.fields
      delete findOptions.fields
    }

    // This is the streaming implementation
    if (callback === undefined) {
      self.emit('find', query, findOptions)
      const convertIdStream = through.obj((chunk, enc, cb) => {
        const mappedData = objectIdToString(chunk)
        self.emit('received', mappedData)
        cb(null, mappedData)
      })
      const cursor = collection.find(castIdProperty(query), findOptions)
      return cursor.stream().pipe(convertIdStream)
    } else if (typeof callback !== 'function') {
      throw new Error('callback must be a function')
    }

    // Callback implementation - Uses lots of memory
    self.emit('find', query, findOptions)
    collection
      .find(castIdProperty(query), findOptions)
      .toArray()
      .then(data => {
        const mappedData = data.map(objectIdToString)
        self.emit('received', mappedData)
        callback(null, mappedData)
      })
      .catch(error => {
        callback(error)
      })
  }

  function findOne(query, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    self.emit('findOne', query)

    collection
      .findOne(castIdProperty(query), options)
      .then(entity => {
        const mappedEntity =
          entity === null ? undefined : objectIdToString(entity)
        self.emit('received', mappedEntity)
        callback(null, mappedEntity)
      })
      .catch(error => {
        callback(error)
      })
  }

  function count(query, callback) {
    self.emit('count', query)

    collection
      .countDocuments(castIdProperty(query))
      .then(data => {
        self.emit('received', data)
        callback(null, data)
      })
      .catch(error => {
        callback(error)
      })
  }

  return Object.assign(self, {
    create,
    createOrUpdate,
    read,
    update,
    updateMany,
    deleteMany,
    delete: del,
    find,
    findOne,
    count,
    idProperty: options.idProperty,
    idType: id => new ObjectId(id)
  })
}

module.exports = createEngine
